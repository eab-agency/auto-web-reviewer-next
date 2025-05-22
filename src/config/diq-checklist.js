// Import dependencies
import puppeteer from "puppeteer";
import { config as dotenvConfig } from "dotenv";
dotenvConfig();
import { checkDIQHiddenFields } from "./checks/diq/checkDIQHiddenFields.js";
import { checkDIQURL } from "./checks/diq/checkDIQURL.js";
import { searchIndexOff } from "./checks/shared/searchIndexOff.js";

(async () => {
  let baseUrl = process.env.ACQUIA_URL;
  if (!baseUrl) {
    console.error("❌ ACQUIA_URL is not defined in the .env file.");
    process.exit(1);
  }

  // Remove trailing '/page-index' if present
  baseUrl = baseUrl.replace(/\/page-index$/, "");

  const diqTermMap = { fall: "fa", spring: "sp", summer: "su" };
  const diqTermSuffix = diqTermMap[process.env.DIQ_term.toLowerCase()];
  if (!diqTermSuffix) {
    console.error(
      '❌ Invalid DIQ_term. Must be "fall", "spring", or "summer".'
    );
    process.exit(1);
  }

  console.log("🚀 Running DIQ checklist...");
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  const diqPagePatterns = [
    "diq-landing-",
    "diq-yes-",
    "diq-probably-",
    "diq-maybe-",
    "diq-maybe-thanks-",
    "diq-defer-",
    "diq-defer-thanks-",
    "diq-no-",
    "diq-no-thanks-",
    "diq-already-did-",
    "diq-processing-yes-",
    "diq-processing-probably-",
    "diq-processing-maybe-",
    "diq-processing-defer-",
    "diq-processing-no-",
    "diq-processing-already-did-",
  ];

  // Construct full DIQ page URLs
  let diqLinks = diqPagePatterns.map(
    (pattern) => `${baseUrl}/${pattern}${diqTermSuffix}`
  );

  // Check if the diq-landing URL is valid
  const diqLandingUrl = diqLinks.find((link) => link.includes("diq-landing-"));
  try {
    await page.goto(diqLandingUrl, { waitUntil: "domcontentloaded" });
    const statusCode = await page.evaluate(() => {
      return document.body.innerText.includes("404") ? 404 : 200;
    });

    if (statusCode === 404) {
      console.error(
        "❌ DIQ project not detected. The diq-landing page returned a 404 error."
      );
      process.exit(1);
    }
  } catch (error) {
    console.error(
      `❌ Error accessing diq-landing URL (${diqLandingUrl}):`,
      error.message
    );
    process.exit(1);
  }

  console.log(`Checked Base URL: ${baseUrl}\n\n### DIQ Page Verification\n`);
  for (const link of diqLinks) {
    try {
      console.log(`\n===========================================`);
      console.log(`Checking: ${link}`);
      console.log(`===========================================\n`);

      await page.goto(link, { waitUntil: "domcontentloaded" });

      await checkDIQHiddenFields(page, link);
      await checkDIQURL(page, link);
      await searchIndexOff(page, link);
    } catch (error) {
      console.error(`❌ Error accessing ${link}:`, error.message);
    }
  }

  console.log("✅ DIQ checklist complete.");
  await browser.close();
})();
