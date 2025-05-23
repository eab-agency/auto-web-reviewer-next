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

    // Configure environment variables for the checklist scripts
    const options = {
      ACQUIA_URL: acquiaUrl,
      CURRENT_PROJECT: currentProject,
    };

    // Add DIQ-specific variables if applicable
    if (currentProject === "DIQ") {
      if (!diqYear || !diqTerm) {
        return {
          statusCode: 400,
          body: JSON.stringify({
            error: "DIQ projects require diqYear and diqTerm parameters.",
          }),
        };
      }
      options.DIQ_year = diqYear;
      options.DIQ_term = diqTerm;
    }

    // Launch the browser with Netlify-compatible settings
    const browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(
        "/var/task/node_modules/@sparticuz/chromium/bin"
      ),
      headless: chromium.headless,
    });

    // Create a new page
    const page = await browser.newPage();

    // Set a user agent
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
    );

    // Capture console logs from the page
    let reviewResults = "";
    page.on("console", (msg) => {
      reviewResults += msg.text() + "\n";
    });

    // Navigate to the requested URL
    await page.goto(acquiaUrl, {
      waitUntil: "domcontentloaded",
      timeout: 30000,
    });

    // Perform checks based on project type
    // This is a simplified version - you would import your actual checklist modules here
    // or implement the checks directly

    // In a real implementation, you would do something like:
    // if (currentProject === "SJ") {
    //   await runSJChecks(page, options);
    // } else if (currentProject === "PS") {
    //   await runPSChecks(page, options);
    // } else if (currentProject === "DIQ") {
    //   await runDIQChecks(page, options);
    // }

    // Example simple check for demonstration
    const title = await page.title();
    reviewResults += `Checked URL: ${acquiaUrl}\nPage title: ${title}\n`;

    // Close the browser
    await browser.close();

    // Return the results
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Review completed successfully",
        reviewResults,
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
  }
}
