// Import dependencies
import { exec } from "child_process";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

// Setup environment variables
dotenv.config();

// Helper for ESM __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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

    // Map project types to their respective script paths - using path.join for better cross-platform compatibility
    const scriptMap = {
      SJ: path.join(__dirname, "sj-checklist.js"),
      PS: path.join(__dirname, "ps-checklist.js"),
      DIQ: path.join(__dirname, "diq-checklist.js"),
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
