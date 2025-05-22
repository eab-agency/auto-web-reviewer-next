const linksOpenInNewTab = async (page, link) => {
  console.log("\n### Links open in new tab");
  console.log(`Checking page: ${link}`);

  // Extract all <a> elements missing target="_blank", excluding those inside <nav> and same-page anchor links
  const missingTargetLinks = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('a:not([target="_blank"])'))
      .filter((a) => {
        const href = a.getAttribute("href");
        return (
          href &&
          !a.closest("nav") && // Ignore links inside <nav>
          !href.startsWith("#") && // Ignore same-page anchor links
          !href.startsWith("mailto:") && // Ignore Email links
          !href.startsWith("tel:") && // Ignore Phone links
          !href.startsWith("https://www.youvisit.com") && // Ignore youvisit links
          !(
            new URL(href, document.baseURI).pathname ===
              window.location.pathname && href.includes("#")
          ) // Ignore same-page links with hash
        );
      })
      .map((a) => a.href);
  });

  if (missingTargetLinks.length === 0) {
    const result = "✅ All links have target='_blank' attribute.\n";
    console.log(result);
    return result;
  }

  let output = "";
  missingTargetLinks.forEach((missingLink) => {
    const anchorTag = `${link}#${encodeURIComponent(missingLink)}`;
    output += `❌ Missing target="_blank": <a href="${anchorTag}" target="_blank">${missingLink}</a>\n`;
  });

  console.log(output);
  return output;
};

module.exports = { linksOpenInNewTab };
