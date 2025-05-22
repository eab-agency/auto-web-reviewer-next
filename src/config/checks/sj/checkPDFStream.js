const checkGuideThanksPDF = async (page, link) => {
  console.log("\n### PDF has ?stream=1");
  console.log(`Checking page: ${link}`);

  if (!link.includes("/guide-thanks")) {
    const result = "ℹ️ Not a guide-thanks page, skipping PDF check.\n";
    console.log(result);
    return result;
  }

  // Extract all <a> elements with an href that contains 'asset/' and ends with '?stream=1'
  const pdfLinks = await page.evaluate(() => {
    return Array.from(document.querySelectorAll("a"))
      .map((a) => a.href)
      .filter((href) => href.includes("asset/") && href.endsWith("?stream=1"));
  });

  if (pdfLinks.length === 0) {
    const result = `❌ No valid PDF link with ?stream=1 found on ${link}\n`;
    console.log(result);
    return result;
  }

  let output = "";
  pdfLinks.forEach((pdfLink) => {
    output += `✅ Found PDF link with ?stream=1: ${pdfLink} on ${link}\n`;
  });

  console.log(output);
  return output;
};

module.exports = { checkGuideThanksPDF };
