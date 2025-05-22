// Check form attribution based on URL parameters
const checkFormAttribution = async (page, link) => {
  console.log("\n### Form Attribution Check");
  console.log(`Checking page: ${link}`);

  let formAttributionOutput = "";

  // Define the paths that require appending attribution values
  const targetPaths = ["/guide", "/request", "/explore", "/apply"];
  const excludedPaths = ["/guide-thanks", "/request-thanks"];

  // Mapping utm_source to required form ID content
  const attributionMap = {
    facebook: "facebook",
    linkedin: "linkedin",
    google: "paidsearch",
  };

  const urlObj = new URL(link);
  const pathname = urlObj.pathname;

  // Ensure the URL matches target paths but is NOT in excluded paths
  if (targetPaths.includes(pathname) && !excludedPaths.includes(pathname)) {
    // Iterate through UTM sources and check each variation
    for (const [utmSource, expectedString] of Object.entries(attributionMap)) {
      const modifiedUrl = `${urlObj.origin}${pathname}?utm_source=${utmSource}`;

      try {
        await page.goto(modifiedUrl, { waitUntil: "domcontentloaded" });

        // Retrieve all form elements
        const formIds = await page.$$eval("form", (forms) =>
          forms.map((form) => form.id.toLowerCase())
        );

        // Check if any form ID contains the expected string
        const hasMatchingForm = formIds.some((id) =>
          id.includes(expectedString)
        );

        if (hasMatchingForm) {
          formAttributionOutput += `✅ Form ID contains "${expectedString}" for utm_source=${utmSource} on ${modifiedUrl}.\n`;
        } else {
          formAttributionOutput += `❌ No matching form ID for utm_source=${utmSource} on ${modifiedUrl}. Found: [${formIds.join(
            ", "
          )}]\n`;
        }
      } catch (error) {
        formAttributionOutput += `❌ Error navigating to ${modifiedUrl}: ${error.message}\n`;
      }
    }
  }

  console.log(
    formAttributionOutput ||
      "No form attribution checks applicable for this page."
  );
  return formAttributionOutput;
};

module.exports = { checkFormAttribution };
