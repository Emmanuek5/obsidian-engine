#!/usr/bin/env node

const { spawn } = require("child_process");
const chokidar = require("chokidar");
const path = require("path");
const fs = require("fs");
const { COLORS } = require("./colours");
const { Server } = require("../../index");
const { Builder } = require("../builder/index.js");

let nodeProcess = null;
let processExited = true;
const args = process.argv.slice(2);
let pathsToWatch = [];
let previousReloadTimer = null;
let defaultFileExt = ["js", "ts", "json", "html", "css", "scss", "md"];
let workingPath = process.cwd();
const mode_types = ["dev", "run", "build"];
let logger = (message) =>
  console.log(
    COLORS.GREEN_TEXT +
      "ENGINE LOGS - " +
      COLORS.applyColor(message, COLORS.BLUE_TEXT)
  );
let mode = "";
if (!args.length == 0) {
  if (fs.existsSync(path.join(workingPath, "obsidian.config.json"))) {
    if (mode_types.includes(args[0])) {
      mode = args[0];
      args.push("server/index.js");
    } else {
      console.error(
        COLORS.applyColor("[ERROR] Usage: build | dev | run", COLORS.RED_TEXT)
      );
      return;
    }
  } else {
    console.error(
      COLORS.applyColor(
        "[ERROR] No Obsidian Engine build detected",
        COLORS.RED_TEXT
      )
    );
    console.log(
      COLORS.applyColor("Building The Application Now", COLORS.GREEN_TEXT)
    );
    const builder = new Builder();
    builder.build();
    console.log(
      COLORS.applyColor(
        "Rerun The Application to get started",
        COLORS.CYAN_TEXT
      )
    );

    return;
  }
} else {
  console.error(
    COLORS.applyColor("Usage: obsidian dev | start | build", COLORS.RED_TEXT)
  );
  return;
}

function startNodeProcess() {
  if (processExited) {
    processExited = false;
    nodeProcess = spawn("node", args.splice(1), { shell: true });
    if (mode == "dev") {
    }
    logger(" Process Started " + new Date().toISOString());
    nodeProcess.stdout.on("data", (data) => {
      if (data.toJSON()) {
        const { type, message } = data;
        if (type && message) {
          return;
        }
      }
      console.log(
        COLORS.GREEN_TEXT +
          "ENGINE LOGS - " +
          COLORS.applyColor(data.toString(), COLORS.BLUE_TEXT)
      );
    });

    nodeProcess.stderr.on("data", (error) => {
      console.log(
        COLORS.applyColor(
          "-----------------------------------------------------------------------------\n",
          COLORS.RED_TEXT
        )
      );
      console.log(
        `${COLORS.RED_TEXT}[ENGINE ERROR] -${COLORS.RESET}  ${error.toString()}`
      );

      console.log(
        COLORS.applyColor(
          "-----------------------------------------------------------------------------\n",
          COLORS.RED_TEXT
        )
      );
    });

    nodeProcess.on("exit", function (code, signal) {
      nodeProcess = null;
      processExited = true;
      logger(COLORS.RED_TEXT + "ENGINE EXITED. BYE BYE");
      process.exit(0);
    });
  }
}

function restartNodeProcess() {
  if (nodeProcess) {
    nodeProcess.kill();
  }
  startNodeProcess();
}

const watcher = chokidar.watch(pathsToWatch);
watcher.on("change", (filePath) => {
  const fileType = path.extname(filePath).substring(1); // Get file extension
  if (fileTypesToWatch.includes(fileType)) {
    clearTimeout(previousReloadTimer);
    previousReloadTimer = setTimeout(restartNodeProcess, 1000); // Restart after a delay to avoid multiple restarts
  }
});

// Start the Node.js process
startNodeProcess();

module.exports = {
  mode,
};
