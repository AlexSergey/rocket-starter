const _compile = require('../core/_compile');

async function analyzerCompiler(options, cb) {
    return await _compile(options, cb);
}

module.exports = analyzerCompiler;
