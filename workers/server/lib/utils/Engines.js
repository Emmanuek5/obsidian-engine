const fs = require("fs");
const path = require("path");

class RenderEngines {
  constructor(defaultRenderer) {
    this.engines = [
      {
        name: "html",
        ext: ".html",
        renderer: this.htmlRenderer.bind(this),
      },
    ];
    this.defaultRenderer = defaultRenderer;
    this.componentPath = path.join(process.cwd(), "/components"); // Relative path to the components folder
    this.layoutPath = path.join(process.cwd(), "/layouts"); // Relative path to the layouts folder
    this.pagesPath = path.join(process.cwd(), "/pages"); // Relative path to the pages folder
  }

  register(name, ext, renderer) {
    this.engines.push({
      name: name,
      ext: ext,
      renderer: renderer,
    });
  }

  getRenderer(name) {
    for (const engine of this.engines) {
      if (engine.name === name) {
        return engine.renderer;
      }
    }
    return this.defaultRenderer;
  }

  htmlRenderer(file, options) {
    // Read the content of the view file
    const filePath = path.join(this.pagesPath, file + ".html");
    let content = fs.readFileSync(filePath, "utf8");
    // Exclude the options.config property
    if (options.config) {
      delete options.config;
    }

    for (const key in options) {
      const variable = options[key];
      const pattern = new RegExp(`<<\\$${key}>>`, "g");
      content = content.replace(pattern, variable);
    }

    // Check for <<</component>>
    content = content.replace(/<\s*<\s*\/([^>]+)>>/g, (match, tagName) => {
      // Check if the component file exists in the base path using __dirname
      const componentFilePath = path.join(
        this.componentPath,
        tagName + ".html"
      );
      try {
        // Read and insert the component content if it exists
        const componentContent = fs.readFileSync(componentFilePath, "utf8");
        return componentContent;
      } catch (error) {
        // If the component file doesn't exist, return an empty string
        console.log(error);
        return "";
      }
    });

    //lets check the directory where the file is located and get the options.json then get all the keys from the json then get the layout 
    //and render the layout with the options
    //get the layout file
    //read the layout file

    const fileDir =  path.dirname(filePath);
    const optionsFilePath = path.join(fileDir, "options.json");
     const defaultOptionsFilePath = path.join(this.pagesPath, "options.json");
    if (fs.existsSync(optionsFilePath)) {
      const optionsFile = fs.readFileSync(optionsFilePath, "utf8");
      const optionsJson = JSON.parse(optionsFile);
      options = Object.assign(options, optionsJson);
      const layoutFile = path.join(
        this.layoutPath,
        optionsJson.layout + ".html"
      );
      const layoutContent = fs.readFileSync(layoutFile, "utf8");
      content = layoutContent.replace(/<<\$content>>/g, content);

      if (options.scripts.length > 0) {
        const scripts = options.scripts.map((script) => {
          return `<script src="scripts/${script}"></script>`;
        });
        // Add the scripts to the content without replacing anything
        content += scripts.join("\n");
      }

      // Return the content
      return content;
    }else if (fs.existsSync(defaultOptionsFilePath)) {
      const optionsFile = fs.readFileSync(defaultOptionsFilePath, "utf8");
      const optionsJson = JSON.parse(optionsFile);
      options = Object.assign(options, optionsJson);
      const layoutFile = path.join(
        this.layoutPath,
        optionsJson.layout + ".html"
      );
      const layoutContent = fs.readFileSync(layoutFile, "utf8");
      content = layoutContent.replace(/<<\$content>>/g, content);

      if (options.scripts.length > 0) {
        const scripts = options.scripts.map((script) => {
          return `<script src="scripts/${script}"></script>`;
        });
        // Add the scripts to the content without replacing anything
        content += scripts.join("\n");
      }

      // Return the content
      return content;
     
    }else {
      return content;
    }
      
  
    
    //return the content
    return content;
  }
}

module.exports = {
  RenderEngines,
};
