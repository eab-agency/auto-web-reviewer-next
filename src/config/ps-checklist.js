// Import dependencies
import puppeteer from "puppeteer";
import dotenv from "dotenv";
dotenv.config();
import { checkUnsureDropdown } from "./checks/shared/unsureDropdown";
import { checkPSFormId } from "./checks/ps/psFormId";
import { searchIndexOff } from "./checks/shared/searchIndexOff";
// import { linksOpenInNewTab } from './checks/sj/linksOpenInNewTab';
import { pagespeedCheck } from "./checks/shared/pageSpeedCheck";
import { lazyVideoCheck } from "./checks/shared/lazyVideo";

(async () => {
  const url = process.env.ACQUIA_URL;
  if (!url) {
    console.error("❌ ACQUIA_URL is not defined in the .env file.");
    process.exit(1);
  }

  console.log("🚀 Running PS checklist...");
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: "domcontentloaded" });

  const links = await page.$$eval(".index-ps-container a", (anchors) =>
    anchors
      .map((anchor) => anchor.href)
      .filter(
        (href) => href.startsWith("http") && !href.includes("?thanks=true")
      )
  );

  console.log(`Checked URL: ${url}\n\n### Form Validation Checks\n`);
  for (const link of links) {
    console.log(`\n===========================================`);
    console.log(`Checking: ${link}`);
    console.log(`===========================================\n`);

    await page.goto(link, { waitUntil: "domcontentloaded" });

    await checkUnsureDropdown(page, link);
    await checkPSFormId(page, link);
    await searchIndexOff(page, link);
    await lazyVideoCheck(page, link);
    await pagespeedCheck(page, link);
  }

  console.log("✅ PS checklist complete.");
  await browser.close();
})();
