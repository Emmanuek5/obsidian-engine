#!/usr/bin/env node

const { spawn } = require("child_process");
const chokidar = require("chokidar");
const path = require("path");
const fs = require("fs");
const { COLORS } = require("./colours");
const { Build } = require("..");


const args = process.argv.slice(2);
const mode_types = ["dev", "run", "build"];
const workingPath = process.cwd();

let nodeProcess = null;
let processExited = true;
let mode = "";

const logger = (message) =>
  console.log(
    COLORS.GREEN_TEXT +
      "ENGINE LOGS - " +
      COLORS.applyColor(message, COLORS.BLUE_TEXT)
  );
  logger("Starting Obsidian Engine " + new Date().toISOString());

if (!args.length || !mode_types.includes(args[0])) {
  console.error(
    COLORS.applyColor("Usage: obsidian dev | start | build", COLORS.RED_TEXT)
  );
  process.exit(1);
}else if(args[0] === "build"){
  let start = new Date().getTime();
  logger("Building Obsidian Engine " + new Date().toISOString());
  const builder = new Build();
  builder.buildAllPages();
  let end = new Date().getTime();
  logger("Build Completed in " + (end - start) + "ms");
  process.exit(0);
}

mode = args[0];
args[0] = ".obsidian/server/index.js";
// Function to start the Node.js process
function startNodeProcess() {
  if (processExited) {
    processExited = false;
    nodeProcess = spawn("node", args, { shell: true });
    logger("Process Started " + new Date().toISOString());
    nodeProcess.stdout.on("data", (data) => {
      console.log(
        COLORS.GREEN_TEXT +
          "ENGINE LOGS - " +
          COLORS.applyColor(data.toString().trim(), COLORS.BLUE_TEXT)
      );
    });

   nodeProcess.stderr.on("data", (error) => {
     console.error(
       COLORS.RED_TEXT + "[ENGINE ERROR] - " + error.toString().trim(),
       COLORS.RESET
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

function stopNodeProcess() {
  if (nodeProcess) {
    logger("Process Stopped " + new Date().toISOString());
    nodeProcess.kill();
  }
}

// Watch for changes in specified file types

// Check for Obsidian Engine build
if (!fs.existsSync(path.join(workingPath, "obsidian.config.json"))) {
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
  builder.build(() => {
    console.log(
      COLORS.applyColor(
        "Rerun The Application to get started",
        COLORS.CYAN_TEXT
      )
    );
  });
} else {
  // Start the Node.js process if build exists
  startNodeProcess();
}

module.exports = {
  mode,
};
