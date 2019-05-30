const _compile = require('../core/_compile');

async function makeWebpackConfig(options, cb) {
    return await _compile(options, cb, true);
}

module.exports = makeWebpackConfig;