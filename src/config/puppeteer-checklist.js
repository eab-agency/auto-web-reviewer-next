// Import dependencies
import { exec } from "child_process";
import dotenv from "dotenv";
dotenv.config();

// Use a function to allow importing this in the API
export const runChecklist = (projectType, options = {}) => {
  return new Promise((resolve, reject) => {
    if (!projectType || !["SJ", "PS", "DIQ"].includes(projectType)) {
      reject(
        new Error("❌ Please provide a valid project type: SJ, PS, or DIQ.")
      );
      return;
    }

    console.log(`🚀 Running checklist for project type: ${projectType}`);

    // Map project types to their respective script paths
    const scriptMap = {
      SJ: "./src/config/sj-checklist.js",
      PS: "./src/config/ps-checklist.js",
      DIQ: "./src/config/diq-checklist.js",
    };

    // Set environment variables for the scripts to use
    Object.entries(options).forEach(([key, value]) => {
      process.env[key] = value;
    });

    // Execute the appropriate script using environment variables
    exec(
      `node "${scriptMap[projectType]}"`,
      {
        env: {
          ...process.env,
          ...options, // Allow passing environment variables
        },
      },
      (error, stdout, stderr) => {
        if (error) {
          console.error(
            `❌ Error executing ${projectType} checklist:`,
            error.message
          );
          reject(error);
          return;
        }

        if (stderr) {
          console.error(`⚠️ Checklist warnings:`, stderr);
        }

        console.log(stdout);
        resolve({ stdout, stderr });
      }
    );
  });
};

// Export the function for use in other modules
module.exports = { runChecklist };

// If this file is run directly, execute with environment variables
if (require.main === module) {
  const projectType = process.env.CURRENT_PROJECT;

  runChecklist(projectType)
    .then(() => console.log("✅ Checklist completed"))
    .catch((err) => {
      console.error("❌ Checklist failed:", err.message);
      process.exit(1);
    });
}
