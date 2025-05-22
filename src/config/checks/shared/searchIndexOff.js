const searchIndexOff = async (page, link) => {
  console.log("\n### Search indexing turned off");
  console.log(`Checking page: ${link}`);

  // Check for <meta name="robots" content="noindex">
  const isNoIndex = await page.evaluate(() => {
    const metaTag = document.querySelector('meta[name="robots"]');
    return metaTag && metaTag.content.includes("noindex");
  });

  let result = "";

  if (isNoIndex) {
    result += `✅ Search indexing is off.\n`;
  } else {
    result += `❌ Search indexing needs to be turned off.\n`;
  }

  // Check for <link rel="preconnect" href="https://admiss.info" crossorigin="">
  const hasPreconnect = await page.evaluate(() => {
    const preconnectTag = document.querySelector(
      'link[rel="preconnect"][href="https://admiss.info"][crossorigin]'
    );
    return !!preconnectTag;
  });

  if (!hasPreconnect) {
    result += `🔍 Consider adding <link rel="preconnect" href="https://admiss.info" crossorigin=""> to improve performance.\n`;
  }

  console.log(result);
  return result;
};

module.exports = { searchIndexOff };
