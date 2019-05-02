const _compile = require('../core/_compile');

async function frontendCompiler(options, cb) {
    return await _compile(options, cb);
}

module.exports = frontendCompiler;