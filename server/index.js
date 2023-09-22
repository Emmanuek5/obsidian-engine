const { Server } = require("../modules");
const { METHODS } = require("../workers/server");
const server = new Server();
server.start();

// Path: server/index.js
// Compare this snippet from workers/server/index.js:

