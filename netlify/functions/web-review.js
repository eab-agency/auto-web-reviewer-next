import chromium from "@sparticuz/chromium";
import puppeteer from "puppeteer-core";
import dotenv from "dotenv";

// Configure environment variables
dotenv.config();

// Set Chromium options for Netlify environment
chromium.setHeadlessMode = true;
chromium.setGraphicsMode = false;

/**
 * Netlify function to run web reviews using Puppeteer
 */
export async function handler(event) {
  // Only allow POST requests
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method not allowed. Please use POST." }),
    };
  }

  let browser = null;

  try {
    // Parse the request body
    const { acquiaUrl, currentProject, diqYear, diqTerm } = JSON.parse(
      event.body
    );

    // Check that the project type is valid
    if (!["SJ", "PS", "DIQ"].includes(currentProject)) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: "Invalid project type. Must be SJ, PS, or DIQ.",
        }),
      };
    }

    // Set environment variables for the checklist scripts
    process.env.ACQUIA_URL = acquiaUrl;
    process.env.CURRENT_PROJECT = currentProject;

    if (currentProject === "DIQ") {
      if (!diqYear || !diqTerm) {
        return {
          statusCode: 400,
          body: JSON.stringify({
            error: "DIQ projects require diqYear and diqTerm parameters.",
          }),
        };
      }
      process.env.DIQ_year = diqYear;
      process.env.DIQ_term = diqTerm;
    }

    // Launch the browser with Netlify-compatible settings
    browser = await puppeteer.launch({
      args: [
        ...chromium.args,
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
        "--single-process", // Add this to help with serverless environments
      ],
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
      timeout: 60000, // Increase timeout for serverless environment
    });

    // Create a results object
    let results = {
      baseUrl: acquiaUrl,
      projectType: currentProject,
      checks: [],
      errors: [],
    };

    // For SJ projects, check each page individually
    if (currentProject === "SJ") {
      // SJ pages to check
      const pagePatterns = [
        "apply",
        "guide",
        "guide-thanks",
        "request",
        "request-thanks",
        "explore",
        "not-ready",
      ];

      // Create full URLs
      const pageUrls = pagePatterns.map(
        (pattern) => acquiaUrl.replace(/\/+$/, "") + "/" + pattern
      );

      // Check each page individually
      for (const url of pageUrls) {
        try {
          // Create a new page for each URL to avoid frame detachment issues
          const page = await browser.newPage();

          // Set a user agent
          await page.setUserAgent(
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
          );

          // Set longer timeouts to avoid timeouts in serverless environment
          page.setDefaultNavigationTimeout(30000);
          page.setDefaultTimeout(30000);

          // Capture console logs
          page.on("console", (msg) => {
            console.log(msg.text());
          });

          // Navigate to the URL
          await page.goto(url, {
            waitUntil: "domcontentloaded",
            timeout: 30000,
          });

          // Basic checks - just as an example
          const title = await page.title();
          const hasMetaDescription = await page.evaluate(() => {
            return !!document.querySelector('meta[name="description"]');
          });

          results.checks.push({
            url,
            title,
            hasMetaDescription,
            timestamp: new Date().toISOString(),
          });

          // Close the page when done to free up resources
          await page.close();
        } catch (error) {
          results.errors.push({
            url,
            error: error.message,
          });
          console.error(`Error processing ${url}:`, error);
        }
      }
    } else {
      // For PS and DIQ projects, just check the main URL
      try {
        const page = await browser.newPage();
        await page.setUserAgent(
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
        );

        page.setDefaultNavigationTimeout(30000);
        page.setDefaultTimeout(30000);

        await page.goto(acquiaUrl, {
          waitUntil: "domcontentloaded",
          timeout: 30000,
        });

        const title = await page.title();
        results.checks.push({
          url: acquiaUrl,
          title,
          timestamp: new Date().toISOString(),
        });

        await page.close();
      } catch (error) {
        results.errors.push({
          url: acquiaUrl,
          error: error.message,
        });
      }
    }

    // Return the results
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Review completed successfully",
        results,
      }),
    };
  } catch (error) {
    console.error("Function error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Failed to complete review",
        message: error.message,
      }),
    };
  } finally {
    // Make sure to close the browser
    if (browser) {
      try {
        await browser.close();
      } catch (closeError) {
        console.error("Error closing browser:", closeError);
      }
    }
  }
}
