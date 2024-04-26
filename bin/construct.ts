#!/usr/bin/env node

import child_process from "child_process";
import fs from "fs-extra";
import packageTemplate from "../templates/package.template.json";
import path from "path";
import inquirer from "inquirer";

// Function to escape special regex characters
function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

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
const excludedItems = ["node_modules", "bin", ".git", "dist", "templates"];

// Ensure the target directory exists before proceeding
function ensureTargetDirectoryExists(target: string) {
  fs.ensureDirSync(target);
  console.log(`Target directory "${target}" ensured.`);
}

// This function will copy all files and directories from source to target
function copyStructure(source: string, target: string, callback: () => void) {
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

// Create the package.json file in the new project
function createPackageJson(target: string, answers: any) {
  let template = JSON.stringify(packageTemplate, null, 2);

  // handle GitHub URL
  // Use escapeRegExp if the URL or any string might contain special regex characters
  const repoRegex = new RegExp(escapeRegExp("{{repositoryUrl}}"), "g");

  template = template
    .replace("{{projectName}}", answers.projectName)
    .replace("{{author}}", answers.author)
    .replace(repoRegex, answers.repositoryUrl)
    .replace("{{description}}", answers.description);

  fs.writeFileSync(path.join(target, "package.json"), template);
  console.log("package.json created successfully.");
}

// This function will change directory and install npm dependencies
function changeDirAndInstall(target: string) {
  process.chdir(target);
  console.log(`Changed working directory to ${target}`);
  console.log("Installing dependencies...");
  child_process.execSync("npm install", { stdio: "inherit" });
}

// This function will prompt the user for project details
async function askQuestions(targetDirectoryName: string | undefined) {
  interface Question {
    type: string;
    name: string;
    message: string;
    default?: string;
  }
  const questions: Question[] = [];

  if (!targetDirectoryName) {
    questions.push({
      type: "input",
      name: "targetDirectoryName",
      message: "What is the target directory name?",
      default: "MyProject", // You can set a default or leave it empty
    });
  }

  questions.push(
    {
      type: "input",
      name: "projectName",
      message: "What is your project name?",
      default: "My Node.js Project",
    },
    {
      type: "input",
      name: "author",
      message: "Who is the author of the project?",
    },
    {
      type: "input",
      name: "repositoryUrl",
      message: "Enter the GitHub URL for the project:",
    },
    {
      type: "input",
      name: "description",
      message: "Provide a brief description of the project:",
    },
  );

  return inquirer.prompt(questions).then((answers) => {
    // If targetDirectoryName was provided, use it, otherwise use the answer from the prompts
    answers.targetDirectoryName =
      targetDirectoryName || answers.targetDirectoryName;
    return answers;
  });
}

function main() {
  askQuestions(targetDirectoryName).then((answers) => {
    console.log("Project will be created in:", answers.targetDirectoryName);
    const targetDirectory = path.resolve(
      process.cwd(),
      answers.targetDirectoryName,
    );
    ensureTargetDirectoryExists(targetDirectory);
    copyStructure(sourceDirectory, targetDirectory, () => {
      createPackageJson(targetDirectory, answers);
      changeDirAndInstall(targetDirectory);
    });
  });
}

main();
