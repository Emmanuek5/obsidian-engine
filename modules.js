const { Config,Router } = require('./.obsidian/workers/index');
const server = require('./.obsidian/workers/server');
module.exports = {
    server,
    Config,
    Router,
};

