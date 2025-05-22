const lazyVideoCheck = async (page, link) => {
  console.log("\n### Lazy Video Loading Check");
  console.log(`Checking page: ${link}`);

  let result = "";

  // Check if a YouTube video exists on the page
  const hasYouTubeVideo = await page.evaluate(() => {
    return !!document.querySelector('iframe[src*="youtube.com"]');
  });

  if (hasYouTubeVideo) {
    // Check for the script: "https://admiss.info/acquia-template/lazy-yt.min.js"
    const hasLazyYTScript = await page.evaluate(() => {
      return !!document.querySelector(
        'script[src="https://admiss.info/acquia-template/lazy-yt.min.js"]'
      );
    });

    if (!hasLazyYTScript) {
      result += `❌ Missing <script src="https://admiss.info/acquia-template/lazy-yt.min.js"></script> for YouTube videos.\n`;
    } else {
      result += `✅ Lazy loading script for YouTube videos is present.\n`;
    }
  } else {
    result += `ℹ️ No YouTube videos found on the page.\n`;
  }

  console.log(result);
  return result;
};

module.exports = { lazyVideoCheck };
