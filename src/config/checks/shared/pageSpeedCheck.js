const pagespeedCheck = async (page, link) => {
  console.log("\n### Google Page Speed Insight");
  console.log(`Checking page: ${link}`);

  // Detect caller file
  const getCallerFile = () => {
    const origFunc = Error.prepareStackTrace;
    let callerFile;
    try {
      const err = new Error();
      Error.prepareStackTrace = (_, stack) => stack;
      const currentFile = err.stack.shift().getFileName();

      while (err.stack.length) {
        callerFile = err.stack.shift().getFileName();
        if (callerFile !== currentFile) break;
      }
    } catch {}
    Error.prepareStackTrace = origFunc;
    return callerFile;
  };

  const caller = getCallerFile();

  // If called from sj-checklist and not an /apply page, skip
  if (caller.includes("sj-checklist.js") && !link.includes("/apply")) {
    const result =
      "ℹ️ PageSpeed check skipped for non-apply pages in SJ checklist.\n";
    console.log(result);
    return result; // Skip check
  }

  let output = "";
  try {
    await page.goto("https://pagespeed.web.dev/", {
      waitUntil: "networkidle2",
    });

    // Select the first text input field on the page
    const inputSelector = 'input[type="text"]';
    await page.waitForSelector(inputSelector); // Wait for the input field to appear
    await page.type(inputSelector, link);

    // Submit the form and wait for the report to load
    await Promise.all([
      page.keyboard.press("Enter"),
      page.waitForNavigation({ waitUntil: "networkidle2" }),
    ]);

    const reportUrl = page.url();
    output = `📊 PageSpeed report: ${reportUrl}\n`;
    console.log(output);
  } catch (error) {
    output = `❌ Failed to generate PageSpeed report for ${link}: ${error.message}\n`;
    console.log(output);
  }

  return output;
};

module.exports = { pagespeedCheck };
