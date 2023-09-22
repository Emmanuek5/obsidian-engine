const { Request } = require("./router/request.js");
const { Response } = require("./router/response.js");
const { METHODS } = require("./utils/constants.js");
const {Router} = require("./router/router.js");
const EventEmitter = require("events").EventEmitter;
const { Server } = require("./router/server.js"); // Import your Server class
const proto = require("./application.js");
const mixin = require("merge-descriptors");
const bodyParser = require("body-parser");

// Create an express-like application
exports = module.exports = createApplication;
function createApplication() {
  // Create an instance of your Server class

  // Attach the server instance to the app object
  const app = function (req, res, next) {
    app.handle(req, res, next);
  };

  mixin(app, proto, false);
  
  // Inherit from your custom Request and Response classes

  // Attach the server instance to the app object
  

  // Your routing logic can go here
  // Define your app.get, app.post, etc. methods to handle routes

  // Example app.get method

  // You can add more route handling methods like app.post, app.put, etc.
   app.init();
  // Return the app
  return app;
}

// Expose the prototypes.
exports.Router = Router;
exports.application = proto;
exports.request = Request;
exports.response = Response;
exports.raw = bodyParser.raw;
exports.static = require("serve-static");
exports.text = bodyParser.text;
exports.urlencoded = bodyParser.urlencoded;
exports.json = bodyParser.json;
