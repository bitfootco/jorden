#!/usr/bin/env node

import child_process from "child_process";
import chalk from "chalk";
import fs from "fs-extra";
import packageTemplate from "../templates/package.template.json";
import path from "path";
import { fileURLToPath } from "url";
import inquirer, { Answers } from "inquirer";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const log = console.log;

function escapeRegExp(text: string) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const sourceDirectory = path.join(__dirname, "..");

function ensureTargetDirectoryExists(target: string) {
  fs.ensureDirSync(target);
  log(chalk.green("Jorden >") + ` Target directory "${target}" ensured.`);
}

function copyStructure(source: string, target: string, callback: () => void) {
  const excludedItems = ["node_modules", "bin", ".git", "dist", "templates"];
  fs.copy(
    source,
    target,
    {
      filter: (src) => !excludedItems.some((item) => src.includes(item)),
    },
    (err) => {
      if (err) {
        console.error("Error copying files:", err);
        process.exit(1);
      }
      log(chalk.green("Jorden >") + " Project structure copied successfully.");
      callback();
    },
  );
}

function createPackageJson(target: string, answers: Answers) {
  let template = JSON.stringify(packageTemplate, null, 2);
  const repoRegex = new RegExp(escapeRegExp("{{repositoryUrl}}"), "g");
  template = template
    .replace("{{projectName}}", answers.projectName)
    .replace("{{author}}", answers.author)
    .replace(repoRegex, answers.repositoryUrl)
    .replace("{{description}}", answers.description);

  fs.writeFileSync(path.join(target, "package.json"), template);
  log(chalk.green("Jorden >") + " package.json created successfully.");
}

function changeDirAndInstall(target: string) {
  process.chdir(target);
  log(chalk.green("Jorden >") + ` Changed working directory to ${target}`);
  log(chalk.green("Jorden >") + ` Installing dependencies...`);
  child_process.execSync("npm install", { stdio: "inherit" });
  log(chalk.green("Jorden >") + ` Dependencies installed successfully.`);
}

async function askQuestions() {
  const questions = [
    {
      type: "input",
      name: "targetDirectoryName",
      message: "What is the target directory name?",
      default: process.argv[2] || "MyProject",
    },
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
  ];
  return inquirer.prompt(questions);
}

function main() {
  askQuestions().then((answers) => {
    const targetDirectory = path.resolve(
      process.cwd(),
      answers.targetDirectoryName,
    );
    log(
      chalk.green("Jorden >") +
        ` Creating project in ${answers.targetDirectoryName}...`,
    );
    ensureTargetDirectoryExists(targetDirectory);
    copyStructure(sourceDirectory, targetDirectory, () => {
      createPackageJson(targetDirectory, answers);
      changeDirAndInstall(targetDirectory);
    });
  });
}

main();
