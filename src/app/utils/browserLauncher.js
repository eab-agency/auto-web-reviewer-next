import chromium from "@sparticuz/chromium";
import puppeteer from "puppeteer-core";

export const launchBrowser = async (options = {}) => {
  const isProduction =
    process.env.NODE_ENV === "production" || process.env.NETLIFY;

  if (isProduction) {
    // Production: Use @sparticuz/chromium
    return await puppeteer.launch({
      args: [
        ...chromium.args,
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
        "--single-process",
      ],
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
      ...options,
    });
  } else {
    // Development: Use regular puppeteer
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
  }
};

export const createPage = async (browser, options = {}) => {
  const page = await browser.newPage();

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
