const { Request } = require("./request");
const { Response } = require("./response");

// components/router.js
class Router {
  constructor() {
    this.routes = {};
  }

  addRoute(path, method, handler) {
    // Initialize this.routes[path] as an empty object if it doesn't exist
    if (!this.routes[path]) {
      this.routes[path] = {};
    }
    this.routes[path][method] = handler;
  }

  /**
   * Add a new route for handling GET requests.
   *
   * @param {string} path - The URL path of the route.
   * @param {function} handler - The function that handles the request.
   * @param {Request} handler.req - The request object.
   * @param {Response} handler.res - The response object.
   * @return {undefined} This function does not return anything.
   */
  get(path, handler) {
    this.addRoute(path, "GET", handler);
  }

  post(path, handler) {
    this.addRoute(path, "POST", handler);
  }

  put(path, handler) {
    this.addRoute(path, "PUT", handler);
  }

  delete(path, handler) {
    this.addRoute(path, "DELETE", handler);
  }

  patch(path, handler) {
    this.addRoute(path, "PATCH", handler);
  }

  head(path, handler) {
    this.addRoute(path, "HEAD", handler);
  }

  update(path, handler) {
    this.addRoute(path, "UPDATE", handler);
  }
}

module.exports = {
  Router,
};
