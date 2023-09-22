const { Request } = require("./router/request");
const { Response } = require("./router/response");
const { Router } = require("./router/router");
const { Server } = require("./router/server");
const { METHODS } = require("./utils/constants");
const { View } = require("./utils/view");

var app = (exports = module.exports = {});

const server = new Server();
const req = new Request(server.getHttpServer());
const res = new Response(server.getHttpServer());

var HTTP_METHODS = ["get", "post", "put", "head", "delete", "patch", "update"];

/**
 * Initializes the app.
 *
 * @param {type} paramName - description of parameter
 * @return {type} description of return value
 */
app.init = function init() {
  this.cache = {};
  this.engines = {};
  this.locals = Object.create(null);
  this.mountpath = "/";
  this.set("view engine", "html"); // Set the default view engine
  this.set("views", "views"); // Set the default views directory
};

/**
 * Listens for incoming requests on the specified port.
 *
 * @param {number} port - The port number to listen on. If not provided, defaults to 3000.
 * @param {function} cb - The callback function to be called when the server is listening.
 * @return {void}
 */
app.listen = function listen(port, cb) {
  server.listen(port || 3000, cb);
};

/**
 * A function that adds middleware to the application.
 *
 * @param {string} file - The file or module to use as middleware.
 * @param {string} basePath - The base path for the middleware.
 */
app.use = function use(file, basePath) {
  server.use(file, basePath);
};

// Define a function to set and get application settings
app.set = function set(setting, val) {
  if (arguments.length === 1) {
    return this.cache[setting];
  }
  this.cache[setting] = val;
  return this;
};

// Define a function to get application settings
app.get = function get(setting) {
  return this.cache[setting];
};

HTTP_METHODS.forEach(function (method) {
  app[method] = function (path, handler) {
    server.addRoute(path, method, handler);
    return this; // Return the app instance for method chaining
  };
});

/**
 * Renders a view with the given name and options.
 *
 * @param {string} name - The name of the view to render.
 * @param {object} options - The options to be passed to the view.
 * @param {function} callback - The callback function to be invoked after rendering.
 * @return {undefined} This function does not return a value.
 */
app.render = function render(name, options, callback) {
  // Set the default view engine from app settings
  const defaultViewEngine = this.get("view engine") || "html";

  // Set the default views directory from app settings
  const viewsDirectory = this.get("views") || "views";

  // Create a new View instance with the provided name and options
  const view = new View(name, {
    root: viewsDirectory,
    ext: `.${defaultViewEngine}`,
    engines: this.engines,
  });

  // Render the view using the View class
  view.render(options, callback);
};

module.exports = app;
