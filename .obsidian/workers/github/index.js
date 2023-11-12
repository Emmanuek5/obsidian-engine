const { execSync } = require("child_process");

class Github {
  constructor(app, token) {
    this.app = app;
    this.token = token;
    console.log("Github initialized");
    console.log("Token:", token);
    this.app.post("/webhook/:token", this.handleWebhook.bind(this));
  }

  inatialiseRepoIfNoneExists() {
    try {
      const result = execSync("git rev-parse --is-inside-work-tree", {
        stdio: "ignore",
      });

      // Check if the command was successful (returns 0) and repository is not inside a work tree
      if (result && result.toString().trim() === "false") {
        console.log("Initializing repository...");
        execSync("git init");
        console.log("Repository initialized successfully");
      } else {
        console.log("Repository is already initialized");
      }
    } catch (error) {
      console.error("Error checking/initializing repository:", error.message);
    }
  }

  handleWebhook(req, res) {
    const token = req.params.token;
    const headers = req.headers;
    console.log(headers);
    if (token !== this.token) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    try {
      const payload = req.body;
      if (this.isPushEvent(payload)) {
        this.handlePushEvent(payload);
      }

      res.status(200).send("Webhook received successfully");
    } catch (error) {
      console.error("Error handling webhook:", error.message);
      res.status(500).send("Internal Server Error");
    }
  }

  setGlobalPullConfig(branch = "main") {
    try {
      execSync(`git config --local pull.rebase false`);
      execSync(`git config --local pull.ff only`);
      console.log(
        `Global pull configuration set successfully for branch ${branch}`
      );
    } catch (error) {
      console.error(
        `Error setting global pull configuration: ${error.message}`
      );
    }
  }

  isPushEvent(payload) {
    return (
      payload &&
      payload.hasOwnProperty("ref") &&
      payload.ref.startsWith("refs/heads/")
    );
  }

  handlePushEvent(payload) {
    const branch = payload.ref.split("/").pop();
    const commit = payload.after;

    // Check if the pushed commit is different from the current commit
    const currentBranch = execSync("git rev-parse --abbrev-ref HEAD")
      .toString()
      .trim();
    const currentCommit = execSync("git rev-parse HEAD").toString().trim();

    if (branch === currentBranch && commit !== currentCommit) {
      this.updateRepository();
    }
  }

  updateRepository() {
    console.log("Updating repository...");
    execSync("git pull origin main"); // Assuming the main branch, modify if needed
    console.log("Repository updated successfully");
    this.app.emit("update"); // Notify the main process that the repository has been updated
  }
}

module.exports = {
  Github,
};
