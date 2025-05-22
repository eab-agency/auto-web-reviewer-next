// Check for "Skip to Content" link if a <nav> exists
const checkSkipToContent = async (page, link) => {
  console.log("\n### Skip to Content Check");
  console.log(`Checking page: ${link}`);

  let skipToContentOutput = "";

  const hasNav = await page.$("nav");
  const hasSkipLink = hasNav ? await page.$('a.skip-link[href="#main"]') : null;

  if (hasNav) {
    if (hasSkipLink) {
      skipToContentOutput += `✅ "Skip to Content" link exists on ${link}.\n`;
    } else {
      skipToContentOutput += `❌ "Skip to Content" link is missing on ${link}.\n`;
    }
  } else {
    skipToContentOutput += `ℹ️ No navigation found on page, skip link not required.\n`;
  }

  console.log(skipToContentOutput);
  return skipToContentOutput;
};

module.exports = { checkSkipToContent };
