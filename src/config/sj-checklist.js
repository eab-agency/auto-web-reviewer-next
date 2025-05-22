// Import dependencies
import puppeteer from "puppeteer";
import dotenv from "dotenv";
import { searchIndexOff } from "./checks/shared/searchIndexOff.js";
import { checkUnsureDropdown } from "./checks/shared/unsureDropdown.js";
import { checkSkipToContent } from "./checks/sj/skipToContent.js";
import { checkFormAttribution } from "./checks/sj/formAttribution.js";
import { linksOpenInNewTab } from "./checks/sj/linksOpenInNewTab.js";
import { checkGuideThanksPDF } from "./checks/sj/checkPDFStream.js";
import { pagespeedCheck } from "./checks/shared/pageSpeedCheck.js";
import { lazyVideoCheck } from "./checks/shared/lazyVideo.js";

dotenv.config();

(async () => {
  let baseUrl = process.env.ACQUIA_URL;
  if (!baseUrl) {
    console.error("❌ ACQUIA_URL is not defined in the .env file.");
    process.exit(1);
  }

  // Remove trailing /page-index if present
  baseUrl = baseUrl.replace(/\/page-index$/, "");

  console.log("🚀 Running SJ checklist...");
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  // Example of how to get the page content after navigating to a URL
  // await page.goto("https://example.com");
  // const pageContent = await page.content();
  // console.log("Page HTML:", pageContent.substring(0, 500) + "..."); // Show first 500 chars

  const sjPagePatterns = [
    "apply",
    "guide",
    "guide-thanks",
    "request",
    "request-thanks",
    "explore",
    "not-ready",
  ];

  // Construct full SJ page URLs
  let sjLinks = sjPagePatterns.map((pattern) => `${baseUrl}/${pattern}`);

  console.log(`Checked Base URL: ${baseUrl}\n\n### SJ Page Verification\n`);
  for (const link of sjLinks) {
    try {
      console.log(`\n===========================================`);
      console.log(`Checking: ${link}`);
      console.log(`===========================================\n`);

      await page.goto(link, { waitUntil: "domcontentloaded" });

      await checkSkipToContent(page, link);
      await checkUnsureDropdown(page, link);
      await checkFormAttribution(page, link);
      await linksOpenInNewTab(page, link);
      await checkGuideThanksPDF(page, link);
      await searchIndexOff(page, link);
      await lazyVideoCheck(page, link);
      await pagespeedCheck(page, link);
    } catch (error) {
      console.error(`❌ Error accessing ${link}:`, error.message);
    }
  }

  console.log("✅ SJ checklist complete.");
  await browser.close();
})();
