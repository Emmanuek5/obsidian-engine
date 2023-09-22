const { Config } = require("./workers/config/index");
const { Server } = require("./workers/server/index");

module.exports = {
  Config: Config,
  Server: Server,
};
