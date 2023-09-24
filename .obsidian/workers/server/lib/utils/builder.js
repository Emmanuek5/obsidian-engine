const fs = require("fs");
const path = require("path");
const { RenderEngines } = require("./Engines"); // Adjust the import path as needed

class Build {
  constructor(sourceDir, distDir) {
    this.sourceDir = process.cwd() + "/pages"; // Set your source directory
    this.distDir = process.cwd() + "/dist"; // Set your destination (dist) directory
    this.renderEngines = new RenderEngines();
  }

  buildAllPages() {
    // Create the dist folder if it does not exist
    if (!fs.existsSync(this.distDir)) {
      fs.mkdirSync(this.distDir, { recursive: true });
    }
    // Build all pages
    this.buildPages(this.sourceDir, this.distDir);
  }

  buildPages(sourcePath, distPath) {
    const items = fs.readdirSync(sourcePath);
    items.forEach((item) => {
      const sourceItemPath = path.join(sourcePath, item);
      const distItemPath = path.join(distPath, item);
      const stats = fs.statSync(sourceItemPath);

      if (stats.isDirectory()) {
        // If it's a directory, create the corresponding directory in dist
        if (!fs.existsSync(distItemPath)) {
          fs.mkdirSync(distItemPath, { recursive: true });
        }
        // Recursively build pages in subdirectories
        this.buildPages(sourceItemPath, distItemPath);
      } else if (stats.isFile() && path.extname(item) === ".html") {
        // If it's an HTML file, render and build the page
        this.renderPage(sourceItemPath, distItemPath);
      }
    });
  }

  renderPage(sourceFilePath, distFilePath) {
    const fileName = path.basename(sourceFilePath, ".html"); // Get the file name without extension
    console.log(fileName);
    const content = this.renderEngines.htmlRenderer(fileName, {}); // Pass only the file name
    fs.writeFileSync(distFilePath, content); // Include the ".html" extension in the dist path
  }
}

module.exports = {
  Build,
};
