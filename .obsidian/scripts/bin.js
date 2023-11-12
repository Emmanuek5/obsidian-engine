#!/usr/bin/env node

class COLORS {
  static GREEN_TEXT = "\x1b[32m";
  static WHITE_TEXT = "\x1b[37m";
  static MAGENTA_TEXT = "\x1b[35m";
  static RED_TEXT = "\x1b[31m";
  static BLUE_TEXT = "\x1b[34m";
  static YELLOW_TEXT = "\x1b[33m";
  static RESET = "\x1b[0m";

  static applyColor(message, color) {
    return color + message + COLORS.RESET;
  }
}

const { execSync } = require("child_process");
const logger = (message, color = COLORS.WHITE_TEXT) => {
  console.log(
    COLORS.GREEN_TEXT + // Change to your preferred color
      "[ENGINE INSTALLER] - " +
      COLORS.applyColor(message, color)
  );
};

console.log = (message) => {
  logger(message);
};

const runCommand = (command, description) => {
  console.log(description);
  try {
    execSync(command, { stdio: "inherit" });
  } catch (error) {
    console.log(`Failed to run command: ${command}`);
    return false;
  }
  console.log("Done.");
  return true;
};

const repoName = process.argv[2];
const gitCheckout = `git clone https://github.com/Emmanuek5/obsidian-engine.git --depth 1  ${repoName}`;
const installDeps = `cd ${repoName} && npm install`;
const startServer = `cd ${repoName} && npm start`;
const deleteGitFolder = `rm -rf ${repoName}/.git`;
const runDev = `cd ${repoName} && npm run install-dev`;

if (runCommand(gitCheckout, "Downloading Git repository...")) {
  if (runCommand(installDeps, "Installing dependencies...")) {
    runCommand(startServer, "Starting the server...");
    if (runCommand(deleteGitFolder, "Deleting .git folder...")) {
      runCommand(runDev, "Running development script...");
    } else {
      console.log("Failed to delete .git folder");
    }
  } else {
    console.log("Failed to install dependencies");
  }
} else {
  console.log(
    "Failed to clone repo, Git is not installed or you are not connected to the internet"
  );
}
