// Import dependencies
import dotenv from "dotenv";
import { fileURLToPath } from "url";
dotenv.config();
import { checkUnsureDropdown } from "./checks/shared/unsureDropdown.js";
import { checkPSFormId } from "./checks/ps/psFormId.js";
import { searchIndexOff } from "./checks/shared/searchIndexOff.js";
import { pagespeedCheck } from "./checks/shared/pageSpeedCheck.js";
import { lazyVideoCheck } from "./checks/shared/lazyVideo.js";
import {
  launchBrowser,
  createPage,
  closeBrowser,
} from "@/app/utils/browserLauncher.js";
// Define the main function that will be exported
const runPSChecklist = async () => {
  const url = process.env.ACQUIA_URL;
  if (!url) {
    console.error("❌ ACQUIA_URL is not defined in the .env file.");
    throw new Error("ACQUIA_URL is not defined");
  }

  console.log("🚀 Running PS checklist...");

  let browser = null;

  try {
    // Launch browser using the shared launcher
    browser = await launchBrowser();
    const page = await createPage(browser);

    await page.goto(url, {
      waitUntil: "domcontentloaded",
      timeout: 30000,
    });

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

      await page.goto(link, {
        waitUntil: "domcontentloaded",
        timeout: 30000,
      });

      await checkUnsureDropdown(page, link);
      await checkPSFormId(page, link);
      await searchIndexOff(page, link);
      await lazyVideoCheck(page, link);
      await pagespeedCheck(page, link);
    }

    console.log("✅ PS checklist complete.");
  } catch (error) {
    console.error("❌ PS checklist failed:", error.message);
    throw error;
  } finally {
    await closeBrowser(browser);
  }
};

// Auto-run if this file is executed directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  runPSChecklist()
    .then(() => console.log("✅ PS checklist execution complete"))
    .catch((err) => {
      console.error("❌ PS checklist failed:", err.message);
      process.exit(1);
    });
}

// Export the function as default
export default runPSChecklist;
