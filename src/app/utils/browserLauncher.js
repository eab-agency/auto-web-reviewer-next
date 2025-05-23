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
      ],
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
      ...options,
    });
  } else {
    // Development: Use puppeteer-core with local Chrome

    // Get the Chrome/Chromium executable path based on the operating system
    const executablePath = (() => {
      // Check if path is provided in options
      if (options.executablePath) return options.executablePath;

      const platform = process.platform;

      if (platform === "darwin") {
        // macOS
        return "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
      } else if (platform === "win32") {
        // Windows
        return "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
      } else if (platform === "linux") {
        // Linux
        return "/usr/bin/google-chrome";
      } else {
        console.warn(
          `Unsupported platform: ${platform}, Chrome executable path must be specified manually`
        );
        return null;
      }
    })();

    if (!executablePath) {
      throw new Error(
        "Chrome executable not found. Please specify executablePath in options."
      );
    }

    return await puppeteer.launch({
      headless: true,
      executablePath,
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
