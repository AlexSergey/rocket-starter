const deepExtend = require('deep-extend');
const _compile = require('../core/_compile');

async function backendCompiler(options, cb) {
    options = deepExtend({}, options, {
        html: false,
        nodejs: true,
    });
    if ((process.env.NODE_ENV || 'development') === 'development') {
        options._liveReload = true;
    }
    return await _compile(options, cb);
}

module.exports = backendCompiler;
