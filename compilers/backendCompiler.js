const deepExtend = require('deep-extend');
const _compile = require('../core/_compile');

async function backendCompiler(options, cb) {
    options = deepExtend({}, options, {
        html: false,
        nodejs: true,
    });
    return await _compile(options, cb);
}

module.exports = backendCompiler;