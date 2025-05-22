// Check if DIQ URL contains correct season suffix
const checkDIQURL = async (page, link) => {
  console.log("\n### DIQ URL Check");
  console.log(`Checking page: ${link}`);

  const expectedTerm = process.env.DIQ_term;

  let urlSuffix = "";
  let expectedSuffix = "";

  // Determine expected suffix based on term
  if (expectedTerm && expectedTerm.toLowerCase() === "fall") {
    expectedSuffix = "-fa";
  } else if (expectedTerm && expectedTerm.toLowerCase() === "spring") {
    expectedSuffix = "-sp";
  } else if (expectedTerm && expectedTerm.toLowerCase() === "summer") {
    expectedSuffix = "-su";
  }

  // Check if links between pages adhere to the same structure
  const links = await page.$$eval("a", (anchors) => anchors.map((a) => a.href));
  for (const linkedPage of links) {
    const linkedURL = new URL(linkedPage);
    const linkedPathParts = linkedURL.pathname.split("/");
    const linkedLastPathPart = linkedPathParts[linkedPathParts.length - 1];

    if (
      linkedLastPathPart.endsWith("-fa") ||
      linkedLastPathPart.endsWith("-sp") ||
      linkedLastPathPart.endsWith("-su")
    ) {
      const linkedSuffix = linkedLastPathPart.slice(-3);
      if (linkedSuffix !== expectedSuffix) {
        return `❌ Mismatched DIQ URL suffix. Expected: ${expectedSuffix}, Found: ${linkedSuffix} in link: ${linkedPage}\n`;
      }
    }
  }

  // Extract actual suffix from URL
  const url = new URL(link);
  const pathParts = url.pathname.split("/");
  const lastPathPart = pathParts[pathParts.length - 1];

  let result = "";
  if (lastPathPart.endsWith(expectedSuffix)) {
    result = `✅ Correct DIQ URL suffix found: ${expectedSuffix}.\n`;
  } else {
    // Try to identify the actual suffix used
    if (
      lastPathPart.endsWith("-fa") ||
      lastPathPart.endsWith("-sp") ||
      lastPathPart.endsWith("-su")
    ) {
      urlSuffix = lastPathPart.slice(-3);
    }
    result = `❌ Incorrect DIQ URL suffix. Expected: ${expectedSuffix}, Found: ${
      urlSuffix || "None"
    }.\n`;
  }

  console.log(result);
  return result;
};

module.exports = { checkDIQURL };
