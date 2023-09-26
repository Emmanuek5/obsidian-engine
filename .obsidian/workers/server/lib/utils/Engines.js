const { match } = require("assert");
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
   this.functions = {
     // Define your functions here
     animate: {
       parameters: ["element", "duration"],
       code: `
      element.animate(
        [
          { transform: 'translateY(0px)' }, 
          { transform: 'translateY(100px)' }
        ],
        { 
          duration: duration,
          iterations: 1, // Play the animation just once
        }
      );
    `,
     },
     fadeIn: {
       parameters: ["element", "duration"],
       code: `
      element.style.opacity = 0;
      element.animate(
        [
          { opacity: 0 },
          { opacity: 1 }
        ],
        { 
          duration: duration,
          iterations: 1, // Play the animation just once
          fill: "forwards" // Keep the end state (opacity 1)
        }
      );
    `,
     },
     fadeOut: {
       parameters: ["element", "duration"],
       code: `
      element.style.opacity = 1;
      element.animate(
        [
          { opacity: 1 },
          { opacity: 0 }
        ],
        { 
          duration: duration,
          iterations: 1, // Play the animation just once
          fill: "forwards" // Keep the end state (opacity 0)
        }
      );
    `,
     },
     rotate: {
       parameters: ["element", "duration"],
       code: `
      element.animate(
        [
          { transform: 'rotate(0deg)' },
          { transform: 'rotate(360deg)' }
        ],
        { 
          duration: duration,
          iterations: 1, // Play the animation just once
        }
      );
    `,
     },
      scale: {
        parameters: ["element", "duration"],
        code: `
        element.animate(
          [
            { transform: 'scale(1)' },
            { transform: 'scale(2)' }
          ],
          { 
            duration: duration,
            iterations: 1, // Play the animation just once
          }
        );
      `,
      },
      slideDown: {
        parameters: ["element", "duration"],
        code: `
        element.style.height = "0px";
        element.animate(
          [
            { height: "0px" },
            { height: "100px" }
          ],
          { 
            duration: duration,
            iterations: 1, // Play the animation just once
            fill: "forwards" // Keep the end state (height 100px)
          }
        );
      `,
      },
      slideUp: {
        parameters: ["element", "duration"],
        code: `
        element.style.height = "100px";
        element.animate(
          [
            { height: "100px" },
            { height: "0px" }
          ],
          { 
            duration: duration,
            iterations: 1, // Play the animation just once
            fill: "forwards" // Keep the end state (height 0px)
          }
        );
      `,
      },
      slideLeft: {
        parameters: ["element", "duration"],
        code: `
        element.style.width = "0px";
        element.animate(
          [
            { width: "0px" },
            { width: "100px" }
          ],
          { 
            duration: duration,
            iterations: 1, // Play the animation just once
            fill: "forwards" // Keep the end state (width 100px)
          }
        );
      `,
      },
      slideRight: {
        parameters: ["element", "duration"],
        code: `
        element.style.width = "100px";
        element.animate(
          [
            { width: "100px" },
            { width: "0px" }
          ],
          { 
            duration: duration,
            iterations: 1, // Play the animation just once
            fill: "forwards" // Keep the end state (width 0px)
          }
        );
      `,
      },
      slideIn : {
        parameters: ["element", "duration"],
        code: `
        element.style.transform = "translateX(-100%)";
        element.animate(
          [
            { transform: "translateX(-100%)" },
            { transform: "translateX(0%)" }
          ],
          { 
            duration: duration,
            iterations: 1, // Play the animation just once
            fill: "forwards" // Keep the end state (width 0px)
          }
        );
      `,
      },
      slideOut : {
        parameters: ["element", "duration"],
        code: `
        element.style.transform = "translateX(0%)";
        element.animate(
          [
            { transform: "translateX(0%)" },
            { transform: "translateX(-100%)" }
          ],
          { 
            duration: duration,
            iterations: 1, // Play the animation just once
            fill: "forwards" // Keep the end state (width 0px)
          }
        );
      `,
      },
   };



    this.defaultRenderer = defaultRenderer;
    this.componentPath = path.join(process.cwd(), "/components"); // Relative path to the components folder
    this.layoutPath = path.join(process.cwd(), "/layouts"); // Relative path to the layouts folder
    this.pagesPath = path.join(process.cwd(), "/pages"); // Relative path to the pages folder
    this.scriptPath = path.join(this.pagesPath, "/define.js");
    this.scriptsDir = path.join(process.cwd(), "/public/js");
    this.stylesDir = path.join(process.cwd(), "/public/css");
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
      content = `<h1>404</h1><p>File not found: ${filePath}</p>`;
      return content;
    }
    const optionsFilePath = path.join(fileDir, "options.json");
    const defaultOptionsFilePath = path.join(this.pagesPath, "options.json");
    if (fs.existsSync(optionsFilePath)) {
      const optionsFile = fs.readFileSync(optionsFilePath, "utf8");
      const optionsJson = JSON.parse(optionsFile);
      options = Object.assign(options, optionsJson.render_options);
    } else if (fs.existsSync(defaultOptionsFilePath)) {
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
      content = this.addFaviconToContent(content);
    }

   //check  for the <script> tag and get the content of the tag
   const scriptRegex = /<script>([\s\S]*?)<\/script>/g;
   const scriptMatches = content.matchAll(scriptRegex);
   for (const match of scriptMatches) {
     const scriptContent = match[1];
     content = content.replace(match[0], this.renderJavascript(scriptContent));
   }


    // Let's check the directory where the file is located and get the options.json,
    // then get all the keys from the JSON, and get the layout to render it with the options.
    // Get the layout file and read its content
    if (fs.existsSync(optionsFilePath)) {
      const optionsFile = fs.readFileSync(optionsFilePath, "utf8");
      const optionsJson = JSON.parse(optionsFile);
      options = Object.assign(options, optionsJson);
      const layoutFile = path.join(
        this.layoutPath,
        optionsJson.layout + ".html"
      );
      let layoutContent = fs.readFileSync(layoutFile, "utf8");
      // Replace <<$content>> in the layout with the actual content
      layoutContent = layoutContent.replace(/<<\$content>>/g, content);

      // Include any JavaScript files directly in the HTML content
      if (options.scripts.length > 0) {
        for (const script of options.scripts) {
          const scriptPath = path.join(this.scriptsDir, script);
          try {
            layoutContent += this.renderJavascript(fs.readFileSync(scriptPath, "utf8"));
          } catch (error) {
            console.error(
              `Error reading script file ${scriptPath}: ${error.message}`
            );
          }
        }
      }

      // Include any stylesheets directly in the HTML content
      if (options.styles.length > 0) {
        for (const style of options.styles) {
          const stylePath = path.join(this.stylesDir, style);
          try {
            const styleContent = fs.readFileSync(stylePath, "utf8");
            layoutContent += `<style>${styleContent}</style>`;
          } catch (error) {
            console.error(
              `Error reading style file ${stylePath}: ${error.message}`
            );
          }
        }
      }

      // Return the layout content with included scripts and styles
      return layoutContent;
    } else if (fs.existsSync(defaultOptionsFilePath)) {
      const optionsFile = fs.readFileSync(defaultOptionsFilePath, "utf8");
      const optionsJson = JSON.parse(optionsFile);
      options = Object.assign(options, optionsJson);
      const layoutFile = path.join(
        this.layoutPath,
        optionsJson.layout + ".html"
      );
      const layoutContent = fs.readFileSync(layoutFile, "utf8");
      // Replace <<$content>> in the layout with the actual content
      layoutContent = layoutContent.replace(/<<\$content>>/g, content);

      // Include any JavaScript files directly in the HTML content
      if (options.scripts.length > 0) {
        for (const script of options.scripts) {
          const scriptPath = path.join(this.scriptsDir, script);
          console.log(scriptPath);
          try {
            layoutContent += this.renderJavascript(fs.readFileSync(scriptPath, "utf8"));
          } catch (error) {
            console.error(
              `Error reading script file ${scriptPath}: ${error.message}`
            );
          }
        }
      }

      // Include any stylesheets directly in the HTML content
      if (options.styles.length > 0) {
        for (const style of options.styles) {
          const stylePath = path.join(this.stylesDir, style);
          try {
            const styleContent = fs.readFileSync(stylePath, "utf8");
            layoutContent += `<style>${styleContent}</style>`;
          } catch (error) {
            console.error(
              `Error reading style file ${stylePath}: ${error.message}`
            );
          }
        }
      }

      // Return the layout content with included scripts and styles
      return layoutContent;
    } else {
      return content;
    }
  }

  isFaviconinContent(content) {
    return content.includes('<link rel="icon" href="');
  }
  addFaviconToContent(content) {
    // Create a regular expression to find the </head> tag in a case-insensitive manner
    const headTagRegex = /<\/head>/i;

    // Define the <link> tag for the favicon
    const faviconLinkTag =
      '<link rel="icon" type="image/x-icon" href="/favicon.ico">';

    // Use the regular expression to replace the </head> tag with the <link> tag followed by </head>;
    return content.replace(headTagRegex, `${faviconLinkTag}</head>`);
  }

  renderJavascript(scriptContents) {
    try {
      const scriptContent = scriptContents
      let modifiedScript = scriptContent;
      // Updated regex to match function calls like lol()
      const functionRegex = /(\w+)\s*\(([^)]*)\);?/g;
      const matches = scriptContent.matchAll(functionRegex);

      for (const match of matches) {
        const functionName = match[1];
        const functionDefinition = this.functions[functionName];
        if (functionDefinition) {
          const functionParameters = functionDefinition.parameters.join(",");
          const parameters = functionDefinition.parameters;
          let code = functionDefinition.code;
          const parameterValues = functionParameters.split(",").map((p) => {
            return p.trim();
          });
          if (parameters.length === parameterValues.length) {
            for (let i = 0; i < parameters.length; i++) {
              const parameterName = parameters[i];
              const parameterValue = parameterValues[i];
              const parameterRegex = new RegExp(`<<\\$${parameterName}>>`, "g");
              code = code.replace(parameterRegex, parameterValue);
            }
            // Append the function code to the modifiedScript
            modifiedScript += `\n function ${functionName}(${functionParameters}){\n${code}\n }`;
          }
        }
      }

      return `<script>${modifiedScript}</script>`;
    } catch (error) {
      console.error(`Error: ${error}`);
      return ""; // Return an empty string if there's an error
    }
  }
}

module.exports = {
  RenderEngines,
};
