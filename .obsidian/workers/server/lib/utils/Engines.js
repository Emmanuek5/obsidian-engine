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
    let content = "";
   
    const filePath = path.join(this.pagesPath, file + ".html");
         const fileDir = path.dirname(filePath);
    if (!fs.existsSync(filePath)) {
      const filePath = path.join(this.pagesPath, file + ".html");
      content = `<h1>404</h1><p>File not found: ${filePath}</p>`;
      return content;
    }
      const optionsFilePath = path.join(fileDir, "options.json");
      const defaultOptionsFilePath = path.join(this.pagesPath, "options.json");
      if (fs.existsSync(optionsFilePath)) {
        const optionsFile = fs.readFileSync(optionsFilePath, "utf8");
        const optionsJson = JSON.parse(optionsFile);
        options = Object.assign(options, optionsJson.render_options);

      }else if (fs.existsSync(defaultOptionsFilePath)) {
        const optionsFile = fs.readFileSync(defaultOptionsFilePath, "utf8");
        const optionsJson = JSON.parse(optionsFile);
        options = Object.assign(options, optionsJson.render_options);
      }
    content = fs.readFileSync(filePath, "utf8");
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

    if (!this.isFaviconinContent(content)) {
     content = this.addFaviconToContent(content)
    }

    //lets check the directory where the file is located and get the options.json then get all the keys from the json then get the layout 
    //and render the layout with the options
    //get the layout file
    //read the layout file


  
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

      if (options.styles.length > 0) {
        const styles = options.styles.map((style) => {
          return `<link rel="stylesheet" href="styles/${style}">`;
        });
        // Add the styles to the content without replacing anything
        content += styles.join("\n");
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
          return `<script src="/scripts/${script}"></script>`;
        });
        // Add the scripts to the content without replacing anything
        content += scripts.join("\n");
      }

      if (options.styles.length > 0) {
        const styles = options.styles.map((style) => {
          return `<link rel="stylesheet" href="/styles/${style}">`;
        });
        // Add the styles to the content without replacing anything
        content += styles.join("\n");
      }
        
      // Return the content
      return content;
     
    }else {
      return content;
    }
  }


  isFaviconinContent(content) {
    return content.includes("<link rel=\"icon\" href=\"");
  }
 addFaviconToContent(content) {
  // Create a regular expression to find the </head> tag in a case-insensitive manner
  const headTagRegex = /<\/head>/i;

  // Define the <link> tag for the favicon
  const faviconLinkTag =
    '<link rel="icon" type="image/x-icon" href="/pub/favicon.ico">';

  // Use the regular expression to replace the </head> tag with the <link> tag followed by </head>;
  return content.replace(headTagRegex, `${faviconLinkTag}</head>`);

}

}

module.exports = {
  RenderEngines,
};
