import chromium from "@sparticuz/chromium-min";
import puppeteer from "puppeteer-core";

export const launchBrowser = async (options = {}) => {
  const isLocal = !!process.env.CHROME_EXECUTABLE_PATH;

  const viewport = {
    deviceScaleFactor: 1,
    hasTouch: false,
    height: 1080,
    isLandscape: true,
    isMobile: false,
    width: 1920,
  };
  const browser = await puppeteer.launch({
    args: isLocal
      ? puppeteer.defaultArgs()
      : [...chromium.args, "--hide-scrollbars", "--incognito", "--no-sandbox"],
    defaultViewport: viewport,
    executablePath:
      process.env.CHROME_EXECUTABLE_PATH ||
      (await chromium.executablePath(
        "https://tempbucket-chromium.s3.us-east-1.amazonaws.com/chromium-v133.0.0-pack.tar"
      )),
    headless: "shell",
    ...options,
  });

  if (!browser) {
    throw new Error("Failed to launch browser");
  }
  return browser;
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
