// server.js - Separate server module
const http = require("http");
const { Request } = require("./request");
const { Response } = require("./response");
const event = require("events");
const { Router } = require("./router");
const eventEmitter = new event.EventEmitter();
const fs = require("fs");
const path = require("path");
// Rest of your code...
class Server extends event.EventEmitter {
  constructor(viewEngine) {
    super();
    this.server = http.createServer(this.handleRequest.bind(this));
    this.routes = {};
    this.on = eventEmitter.on;
    this.emit = eventEmitter.emit;
    this.viewEngine = viewEngine;
  }

  handleRequest(req, res) {
    const request = new Request(req);
    const response = new Response(res);
    response.viewEngine = this.viewEngine;

    // Your routing logic goes here based on request.path
    // You can use request.method to handle different HTTP methods (GET, POST, etc.)
    // You can use request.headers to handle different headers

    if (
      this.routes[request.path] &&
      this.routes[request.path][request.method]
    ) {
      const routeHandler = this.routes[request.path][request.method];
      routeHandler(request, response);
    } else {
      // Handle other routes or methods here
      response.setStatus(404).send("Not Found");
    }
  }

  /**
   * Use the specified file to add routes to the server.
   *
   * @param {string} file - The path of the file to require.
   * @param {string} basePath - The base path under which to add the routes.
   * @throws {Error} Throws an error if the file does not export an instance of the Router class.
   */
  use(file, basePath) {
    // Check if the file is a directory
    if (fs.existsSync(file)) {
      const stats = fs.statSync(file);
      if (stats.isDirectory()) {
        // Serve all files in the directory when the basePath is accessed
        this.addRoute(basePath, "GET", (req, res) => {
          let html = "<ul>";
          fs.readdirSync(file).forEach((fileName) => {
            const filePath = path.join(file, fileName); // Use path.join to create file paths
            const routePath = path.join(basePath, fileName).replace(/\\/g, "/"); // Replace backslashes with forward slashes
            html += `<li><a href="${routePath}">${fileName}</a></li>`;
          });
          html += "</ul>";
          res.send(html);
        });

        fs.readdirSync(file).forEach((fileName) => {
          const filePath = path.join(file, fileName); // Use path.join for file paths
          const routePath = path.join(basePath, fileName).replace(/\\/g, "/"); // Replace backslashes with forward slashes
          // Check if the current file is a directory
          const fileStats = fs.statSync(filePath);
          if (fileStats.isDirectory()) {
            // Serve all files in the directory
            this.dir(filePath, routePath);
          } else {
            // Serve the file
            this.addRoute(routePath, "GET", (req, res) => {
              res.file(filePath);
            });
          }
        });
      } else {
         const routerModule = require(file);

         // Check if the file is a Router instance or has routes
         if (routerModule instanceof Router || routerModule.routes) {
           // Add your existing route handling logic here
           const routerRoutes = routerModule.routes;

           if (!this.routes[basePath]) {
             this.routes[basePath] = {};
           }

           for (const path in routerRoutes) {
             for (const method in routerRoutes[path]) {
               this.routes[basePath][method] = routerRoutes[path][method];
             }
           }
         } else {
           throw new Error(
             "Expected a Router instance or directory, Received something else: " +
               routerModule
           );
         }
      }
    } else {
      throw new Error("File does not exist: " + file);
    }
  }

  /**
   * Adds a route to the API.
   *
   * @param {string} path - The URL path of the route.
   * @param {string} method - The HTTP method of the route.
   * @param {function} handler - The handler function for the route.
   */
  addRoute(path, method, handler) {
    if (!this.routes[path]) {
      this.routes[path] = {};
    }
    this.routes[path][method] = handler;
  }
  dir(dirPath, httpPath) {
    if (!fs.existsSync(dirPath) || !fs.statSync(dirPath).isDirectory()) {
      throw new Error("Directory does not exist: " + dirPath);
    }

    // Serve directory listing when the basePath is accessed
    this.addRoute(httpPath, "GET", (req, res) => {
      const files = fs.readdirSync(dirPath);

      let html = "<ul>";
      files.forEach((fileName) => {
        const filePath = path.join(dirPath, fileName);
        const routePath = path.join(httpPath, fileName);
        const isDirectory = fs.statSync(filePath).isDirectory();
        const linkText = isDirectory ? fileName + "/" : fileName;
        html += `<li><a href="${routePath}">${linkText}</a></li>`;
      });
      html += "</ul>";
      res.send(html);
    });

    // Serve files within the directory
    fs.readdirSync(dirPath).forEach((fileName) => {
      const filePath = path.join(dirPath, fileName); // Use path.join for file paths
      const routePath = path.join(httpPath, fileName).replace(/\\/g, "/"); // Replace backslashes with forward slashes
      this.addRoute(routePath, "GET", (req, res) => {
        res.file(filePath);
      });
    });
  }

  listen(startingPort, callback) {
    let port = startingPort;

    const tryListening = () => {
      this.server.listen(port, () => {
        if (callback) {
          callback(port);
        }
        this.emit("listening");
      });

      this.server.on("error", (error) => {
        if (error.code === "EADDRINUSE") {
          console.log(`Port ${port} is in use, trying the next one...`);
          port++;
          tryListening(); // Try the next port
        } else {
          throw error; // Throw other errors
        }
      });
    };

    tryListening(); // Start listening on the specified port
  }

  setViewEngine(viewEngine) {
    this.viewEngine = viewEngine;
  }
  getHttpServer() {
    return this.server;
  }
}

module.exports = {
  Server,
  eventEmitter,
};
