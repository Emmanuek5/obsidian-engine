const { Config,Router } = require('./workers');
const server = require('./workers/server/index');
module.exports = {
    server,
    Config,
    Router,
};

