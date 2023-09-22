// server.js - Separate server module
const http = require("http");
const { Request } = require("./request");
const { Response } = require("./response");
const event = require("events");
const { Router } = require("./router");
const eventEmitter = new event.EventEmitter();
const fs = require("fs");
// Rest of your code...
class Server extends event.EventEmitter {
  constructor() {
    super();
    this.server = http.createServer(this.handleRequest.bind(this));
    this.routes = {};
    this.on = eventEmitter.on;
    this.emit = eventEmitter.emit;
    this.viewEngine = null;
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
    // Require the specified file
    const routerModule = require(file);

    // Check if the file exports an instance of the Router class
    if (routerModule instanceof Router || routerModule.routes ) {
      // Get the routes from the router module
      const routerRoutes = routerModule.routes;

      // Add the routes to the server under the specified basePath
      if (!this.routes[basePath]) {
        this.routes[basePath] = {};
      }

      for (const path in routerRoutes) {
        for (const method in routerRoutes[path]) {
          this.routes[basePath][method] = routerRoutes[path][method];
        }
      }
    } else {
      throw new Error("Expected a Router instance, Received something else" + routerModule);
    }
  }

  addRoute(path, method, handler) {
    if (!this.routes[path]) {
      this.routes[path] = {};
    }
    this.routes[path][method] = handler;
  }

  listen(port, callback) {
    this.server.listen(port, () => {
      if (callback) {
        callback();
        return;
      }
      this.emit("listening");
      console.log(`Server is running on port ${port}`);
    });
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
