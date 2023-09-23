const { Config } = require('./workers');
const server = require('./workers/server/index');
module.exports = {
    server,
    Config,
}

