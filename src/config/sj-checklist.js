// Import dependencies
import dotenv from "dotenv";
import { searchIndexOff } from "./checks/shared/searchIndexOff.js";
import { checkUnsureDropdown } from "./checks/shared/unsureDropdown.js";
import { checkSkipToContent } from "./checks/sj/skipToContent.js";
import { checkFormAttribution } from "./checks/sj/formAttribution.js";
import { linksOpenInNewTab } from "./checks/sj/linksOpenInNewTab.js";
import { checkGuideThanksPDF } from "./checks/sj/checkPDFStream.js";
import { pagespeedCheck } from "./checks/shared/pageSpeedCheck.js";
import { lazyVideoCheck } from "./checks/shared/lazyVideo.js";
import { fileURLToPath } from "url";
import {
  launchBrowser,
  createPage,
  closeBrowser,
} from "@/app/utils/browserLauncher.js";

dotenv.config();

// Define the main function that will be exported
const runSJChecklist = async () => {
  let baseUrl = process.env.ACQUIA_URL;
  if (!baseUrl) {
    console.error("❌ ACQUIA_URL is not defined in the .env file.");
    throw new Error("ACQUIA_URL is not defined");
  }

  // Remove trailing /page-index if present
  baseUrl = baseUrl.replace(/\/page-index$/, "");

  console.log("🚀 Running SJ checklist...");

  let browser = null;

  try {
    // Launch browser using the shared launcher
    browser = await launchBrowser();

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
      let page = null;
      try {
        console.log(`\n===========================================`);
        console.log(`Checking: ${link}`);
        console.log(`===========================================\n`);

        // Create a NEW page for each URL to avoid frame detachment
        page = await createPage(browser);

        await page.goto(link, {
          waitUntil: "domcontentloaded",
          timeout: 30000,
        });

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
      } finally {
        // Close the page after each URL to free memory
        if (page) {
          try {
            await page.close();
          } catch (closeError) {
            console.error(`Error closing page for ${link}:`, closeError);
          }
        }
      }
    }

    console.log("✅ SJ checklist complete.");
  } catch (error) {
    console.error("❌ SJ checklist failed:", error.message);
    throw error;
  } finally {
    await closeBrowser(browser);
  }
};

// Auto-run if this file is executed directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  runSJChecklist()
    .then(() => console.log("✅ SJ checklist execution complete"))
    .catch((err) => {
      console.error("❌ SJ checklist failed:", err.message);
      process.exit(1);
    });
}

// Export the function as default
export default runSJChecklist;
