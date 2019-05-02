const frontendCompiler = require('./frontendCompiler');
const backendCompiler = require('./backendCompiler');
const { isString } = require('valid-types');
const makeMode = require('../modules/makeMode');
const deepExtend = require('deep-extend');

async function libraryCompiler(libraryName, options = {}, cb) {
    if (!isString(libraryName)) {
        console.error('libraryName mus\'t be a string!');
        return process.exit(1);
    }
    let mode = makeMode();
    options = deepExtend({}, options, {
        library: libraryName
    }, (mode === 'production' ? {
        html: !options.html ? false : options.html
    } : {}));
    if (options.nodejs) {
        return await backendCompiler(options, cb);
    }
    return await frontendCompiler(options, cb);
}

module.exports = libraryCompiler;