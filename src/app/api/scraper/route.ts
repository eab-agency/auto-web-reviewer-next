import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium-min";

chromium.setGraphicsMode = false;

export async function POST(req: Request) {
  const { url, currentProject } = await req.json();

  // Optional: Load any fonts you need.
  await chromium.font(
    "https://raw.githack.com/googlei18n/noto-emoji/master/fonts/NotoColorEmoji.ttf"
  );

  const isLocal = !!process.env.CHROME_EXECUTABLE_PATH;

  const viewport = {
    deviceScaleFactor: 1,
    hasTouch: false,
    height: 1080,
    isLandscape: true,
    isMobile: false,
    width: 1920,
  };
  const browser = await puppeteer.launch({
    args: isLocal
      ? puppeteer.defaultArgs()
      : [...chromium.args, "--hide-scrollbars", "--incognito", "--no-sandbox"],
    defaultViewport: viewport,
    executablePath:
      process.env.CHROME_EXECUTABLE_PATH ||
      (await chromium.executablePath(
        "https://tempbucket-chromium.s3.us-east-1.amazonaws.com/chromium-v133.0.0-pack.tar"
      )),
    headless: "shell",
  });

  const page = await browser.newPage();
  await page.goto("https://go.graduate.online.msstate.edu/page-index");
  const pageTitle = await page.title();
  await browser.close();

  return Response.json({
    message: "Scraper endpoint is not yet implemented",
    url,
    currentProject,
    pageTitle,
  });

  // try {
  //   // Check that the project type is valid
  //   if (!["SJ", "PS", "DIQ"].includes(currentProject)) {
  //     throw new Error(`Invalid project type: ${currentProject}`);
  //   }

  //   // Create environment variables for the script
  //   const options: Record<string, string> = {
  //     ACQUIA_URL: url,
  //     CURRENT_PROJECT: currentProject,
  //   };

  //   // Use a memory stream to capture output instead of writing to file
  //   let scraperResults = "";

  //   // Setup a custom console.log that captures output
  //   const originalConsoleLog = console.log;
  //   console.log = function (...args: unknown[]) {
  //     const message = args.join(" ");
  //     scraperResults += message + "\n";
  //     originalConsoleLog.apply(console, args);
  //   };

  //   // Run the scraper directly with the options
  //   await runScraper(currentProject, options);

  //   // Restore original console.log
  //   console.log = originalConsoleLog;

  //   return new Response(
  //     JSON.stringify({
  //       message: "Scraper completed successfully",
  //       scraperResults,
  //     }),
  //     { status: 200 }
  //   );
  // } catch (err) {
  //   const error = err as Error;
  //   console.error(error);
  //   return new Response(
  //     JSON.stringify({
  //       error: "Failed to complete scraper",
  //       message: error.message,
  //     }),
  //     { status: 500 }
  //   );
  // }
}
