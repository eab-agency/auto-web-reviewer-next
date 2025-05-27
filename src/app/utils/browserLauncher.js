import chromium from "@sparticuz/chromium-min";
import puppeteer from "puppeteer-core";

export const launchBrowser = async (options = {}) => {
  const isProduction =
    process.env.NODE_ENV === "production" || process.env.NETLIFY;

  if (isProduction) {
    console.log("Using production browser settings with @sparticuz/chromium");

    return await puppeteer.launch({
      args: [
        ...chromium.args,
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
        "--single-process",
        "--no-zygote",
        "--disable-background-timer-throttling",
        "--disable-backgrounding-occluded-windows",
        "--disable-renderer-backgrounding",
        "--memory-pressure-off", // Reduce memory pressure
        "--max_old_space_size=512", // Limit memory usage
      ],
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
      ignoreHTTPSErrors: true,
      timeout: 60000,
      ...options,
    });
  } else {
    console.log("Using development browser settings");

    // Try to use regular puppeteer for development
    try {
      const puppeteerRegular = await import("puppeteer");
      return await puppeteerRegular.default.launch({
        headless: true,
        args: [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-dev-shm-usage",
        ],
        ...options,
      });
    } catch {
      // Fallback to @sparticuz/chromium
      return await puppeteer.launch({
        args: [
          ...chromium.args,
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-dev-shm-usage",
          "--disable-gpu",
        ],
        defaultViewport: chromium.defaultViewport,
        executablePath: await chromium.executablePath(),
        headless: chromium.headless,
        ...options,
      });
    }
  }
};

export const createPage = async (browser, options = {}) => {
  const page = await browser.newPage();

  // Set shorter timeouts to avoid function timeouts
  page.setDefaultNavigationTimeout(25000);
  page.setDefaultTimeout(25000);

  if (options.userAgent !== false) {
    await page.setUserAgent(
      options.userAgent ||
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
    );
  }

  return page;
};

export const closeBrowser = async (browser) => {
  if (browser) {
    try {
      await browser.close();
    } catch (closeError) {
      console.error("Error closing browser:", closeError);
    }
  }
};
