import { NextRequest, NextResponse } from "next/server";

// Import the runChecklist function from puppeteer-checklist
import { runChecklist } from "../../../config/puppeteer-checklist";

export async function POST(req: NextRequest) {
  const { acquiaUrl, currentProject, diqYear, diqTerm } = await req.json();

  try {
    // Check that the project type is valid
    if (!["SJ", "PS", "DIQ"].includes(currentProject)) {
      throw new Error(`Invalid project type: ${currentProject}`);
    }

    // Create environment variables for the script
    // NOTE: Puppeteer scripts read their config from environment variables.
    // This is a common pattern for headless browser scripts, so we're passing
    // the URL and other settings via environment variables rather than
    // direct function parameters. The checklist scripts (ps-checklist.js,
    // sj-checklist.js, diq-checklist.js) access these values via process.env.
    const options: Record<string, string> = {
      ACQUIA_URL: acquiaUrl,
      CURRENT_PROJECT: currentProject,
    };

    // Add DIQ-specific variables if applicable
    if (currentProject === "DIQ") {
      if (!diqYear) throw new Error("DIQ Year is required for DIQ projects");
      if (!diqTerm) throw new Error("DIQ Term is required for DIQ projects");

      options.DIQ_year = diqYear;
      options.DIQ_term = diqTerm;
    }

    // Use a memory stream to capture output instead of writing to file
    let reviewResults = "";

    // Setup a custom console.log that captures output
    const originalConsoleLog = console.log;
    console.log = function (...args: unknown[]) {
      const message = args.join(" ");
      reviewResults += message + "\n";
      originalConsoleLog.apply(console, args);
    };

    // Run the checker directly with the options
    await runChecklist(currentProject, options);

    // Restore original console.log
    console.log = originalConsoleLog;

    return NextResponse.json({
      message: "Review completed successfully",
      reviewResults,
    });
  } catch (err) {
    const error = err as Error;
    console.error(error);
    return NextResponse.json(
      { error: "Failed to complete review", message: error.message },
      { status: 500 }
    );
  }
}
