const server = require('./server/index');
const {Router} = require('./server/lib/router/router');
const {Config} = require('./config/index');


module.exports = {
    Config,
    Router,
    server,
    Build: server.builder,
}