const fs = require("fs");
const path = require("path");
const { RenderEngines } = require("./Engines"); // Adjust the import path as needed

class Build {
  constructor() {
    this.sourceDir = process.cwd() + "/pages"; // Set your source directory
    this.distDir = process.cwd() + "/dist"; // Set your destination (dist) directory
    this.scriptsDir = process.cwd() + "/public/js"; // Set your scripts directory
    this.stylesDir = process.cwd() + "/public/css"; // Set your styles directory
    this.pagesdistDir = process.cwd() + "/dist/pages"; // Set your destination (dist) directory
    this.renderEngines = new RenderEngines();
  }

  buildAllPages() {
    // Create the dist folder if it does not exist
    if (!fs.existsSync(this.distDir)) {
      fs.mkdirSync(this.distDir, { recursive: true });
    }
    if (!fs.existsSync(this.pagesdistDir)) {
      fs.mkdirSync(this.pagesdistDir, { recursive: true });
    }
    // Build all pages
    this.buildPages(this.sourceDir, this.distDir);
  }

  buildPages(sourcePath, distPath) {
    const items = fs.readdirSync(sourcePath);
    items.forEach((item) => {
      const sourceItemPath = path.join(sourcePath, item);
      const distItemPath = path.join(this.pagesdistDir, item);
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
    const relativePath = path.relative(this.sourceDir, sourceFilePath);
    const parts = relativePath.split(path.sep); // Split the path by separator (e.g., / or \)
    let fileName = parts.pop(); // Get the last part, which is the file name
    const folderName = parts.join("/"); // Join the remaining parts as the folder name

    // Remove the file extension from the file name
    fileName = path.basename(fileName, path.extname(fileName));

    // If the folder name is not empty, prepend it to the file name
    if (folderName !== "") {
      fileName = `${folderName}/${fileName}`;
    }

    console.log(fileName);

    const content = this.renderEngines.htmlRenderer(fileName, {});
    fs.writeFileSync(distFilePath, content);
  }

  buildAllScripts() {
    // Copy all scripts to the dist/scripts directory
    this.copyFolder(this.scriptsDir, path.join(this.distDir, "scripts"));
  }

  buildALLStyles(){
        this.copyFolder(this.stylesDir, path.join(this.distDir, "styles"));
  }

  copyFolder(src, dest) {
    fs.mkdirSync(dest, { recursive: true });
    const items = fs.readdirSync(src);
    items.forEach((item) => {
      const srcItemPath = path.join(src, item);
      const destItemPath = path.join(dest, item);
      const stats = fs.statSync(srcItemPath);
      if (stats.isDirectory()) {
        this.copyFolder(srcItemPath, destItemPath);
      } else if (stats.isFile()) {
        fs.copyFileSync(srcItemPath, destItemPath);
      }
    });
  }
}

module.exports = {
  Build,
};
