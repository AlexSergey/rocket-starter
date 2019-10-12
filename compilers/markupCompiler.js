const deepExtend = require('deep-extend');
const { isDefined, isUndefined, isArray } = require('valid-types');
const _compile = require('../core/_compile');
const glob = require('glob');

function _getOptions(pth, options, cb, configOnly) {
    return new Promise((resolve, reject) => {
        glob(pth, {absolute: true}, async function (err, files) {
            if (err) {
                return reject(err);
            }
            if (files.length === 0) {
                console.error('Invalid path');
                return process.exit(1);
            }
            let html = isUndefined(options.html) ? [] : options.html;
            html = isDefined(html) ? (isArray(html) ? html : [html]) : [];

            options = deepExtend({}, options, {
                html: html.concat(files.map(file => ({
                    template:  file
                })))
            });

            return resolve(options);
        })
    })
}

async function markupCompiler(pth, options = {}, cb, configOnly = false) {
    if (!pth) {
        console.error('Path can\'t be empty!');
        return process.exit(1);
    }
    if ((process.env.NODE_ENV || 'development') === 'development') {
        options._liveReload = true;
    }
    try {
        options = await _getOptions(pth, options, cb, configOnly);

        return await _compile(options, cb, configOnly);
    } catch (err) {
        console.error(err);
        return process.exit(1);
    }
}

module.exports = markupCompiler;
