#!/usr/bin/env node

const fs = require("fs-extra");
const path = require("path");
const child_process = require("child_process");

// Use __dirname to reference the directory where the script is located,
// which should be inside the NPM package.
const sourceDirectory = path.join(__dirname, "..");

// Retrieve the target directory from the command line arguments
const targetDirectoryName = process.argv[2];

if (!targetDirectoryName) {
  console.error(
    "Error: No directory name provided. Usage: create-jorden-app <directory-name>",
  );
  process.exit(1);
}

// Resolve the target directory relative to the current working directory
const targetDirectory = path.resolve(process.cwd(), targetDirectoryName);

// Define an array of directories and files to exclude from the copy process
const excludedItems = ["node_modules", "bin", ".git", "dist"];

// Ensure the target directory exists before proceeding
function ensureTargetDirectoryExists(target) {
  fs.ensureDirSync(target);
  console.log(`Target directory "${target}" ensured.`);
}

// This function will copy all files and directories from source to target
function copyStructure(source, target, callback) {
  fs.copy(
    source,
    target,
    {
      filter: (src) => {
        // Exclude any paths that contain the excluded items
        return !excludedItems.some((item) => src.includes(item));
      },
    },
    (err) => {
      if (err) {
        console.error("Error copying files:", err);
        process.exit(1);
      }
      console.log(`Project copied to ${targetDirectory}`);
      callback();
    },
  );
}

// This function will change directory and install npm dependencies
function changeDirAndInstall(target) {
  process.chdir(target);
  console.log(`Changed working directory to ${target}`);
  console.log("Installing dependencies...");
  child_process.execSync("npm install", { stdio: "inherit" });
}

// Start the process
ensureTargetDirectoryExists(targetDirectory);
copyStructure(sourceDirectory, targetDirectory, () =>
  changeDirAndInstall(targetDirectory),
);
