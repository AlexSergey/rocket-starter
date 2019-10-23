const frontendCompiler = require('./frontendCompiler');
const backendCompiler = require('./backendCompiler');
const { isString } = require('valid-types');
const makeMode = require('../modules/makeMode');
const deepExtend = require('deep-extend');
const errors = require('../errors/libraryCompiler');

async function libraryCompiler(libraryName, options = {}, cb, configOnly = false) {
    if (!isString(libraryName)) {
        console.error(errors.MUST_BE_STRING);
        return process.exit(1);
    }
    let mode = makeMode();
    options = deepExtend({}, options, {
        library: libraryName
    }, (mode === 'production' ? {
        html: !options.html ? false : options.html
    } : {}));

    if (!options.html) {
        options.onlyWatch = true;
    }
    else {
        if ((process.env.NODE_ENV || 'development') === 'development') {
            options._liveReload = true;
        }
    }
    if (options.nodejs) {
        return await backendCompiler(options, cb, configOnly);
    }
    return await frontendCompiler(options, cb, configOnly);
}

module.exports = libraryCompiler;
