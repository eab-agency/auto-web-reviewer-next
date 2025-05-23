// Import dependencies
import dotenv from "dotenv";
import { fileURLToPath } from "url";
// Setup environment variables
dotenv.config();

// Use a function to allow importing this in the API
export const runChecklist = (projectType, options = {}) => {
  return new Promise(async (resolve, reject) => {
    if (!projectType || !["SJ", "PS", "DIQ"].includes(projectType)) {
      reject(
        new Error("❌ Please provide a valid project type: SJ, PS, or DIQ.")
      );
      return;
    }

    console.log(`🚀 Running checklist for project type: ${projectType}`);

    // Set environment variables for the scripts to use
    Object.entries(options).forEach(([key, value]) => {
      process.env[key] = value;
    });

    try {
      // Instead of running as separate processes, import and run the modules directly
      let stdout = "";
      let stderr = "";

      // Save original console.log and console.error
      const originalConsoleLog = console.log;
      const originalConsoleError = console.error;

      // Override console.log to capture output
      console.log = (...args) => {
        const message = args.join(" ");
        stdout += message + "\n";
        originalConsoleLog.apply(console, args);
      };

      // Override console.error to capture errors
      console.error = (...args) => {
        const message = args.join(" ");
        stderr += message + "\n";
        originalConsoleError.apply(console, args);
      };

      // Dynamically import the appropriate module
      try {
        if (projectType === "SJ") {
          const { default: runSJChecklist } = await import("./sj-checklist.js");
          await runSJChecklist();
        } else if (projectType === "PS") {
          const { default: runPSChecklist } = await import("./ps-checklist.js");
          await runPSChecklist();
        } else if (projectType === "DIQ") {
          const { default: runDIQChecklist } = await import(
            "./diq-checklist.js"
          );
          await runDIQChecklist();
        }

        // Restore console functions
        console.log = originalConsoleLog;
        console.error = originalConsoleError;

        resolve({ stdout, stderr });
      } catch (error) {
        // Restore console functions in case of error
        console.log = originalConsoleLog;
        console.error = originalConsoleError;

        console.error(
          `❌ Error importing or running ${projectType} checklist:`,
          error.message
        );
        reject(error);
      }
    } catch (error) {
      console.error(
        `❌ Error executing ${projectType} checklist:`,
        error.message
      );
      reject(error);
    }
  });
};

// ESM version of checking if file is run directly
const isMainModule = process.argv[1] === fileURLToPath(import.meta.url);

if (isMainModule) {
  const projectType = process.env.CURRENT_PROJECT;

  runChecklist(projectType)
    .then(() => console.log("✅ Checklist completed"))
    .catch((err) => {
      console.error("❌ Checklist failed:", err.message);
      process.exit(1);
    });
}
