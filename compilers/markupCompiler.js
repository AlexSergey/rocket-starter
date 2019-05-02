const deepExtend = require('deep-extend');
const _compile = require('../core/_compile');
const glob = require('glob');

async function markupCompiler(pth, options = {}, cb) {
    if (!pth) {
        console.error('Path can\'t be empty!');
        return process.exit(1);
    }
    glob(pth, {absolute: true}, async function (err, files) {
        if (err) {
            console.error(err);
            return process.exit(1);
        }
        if (files.length === 0) {
            console.error('Invalid path');
            return process.exit(1);
        }
        options = deepExtend({}, options, {
            html: files.map(file => ({
                template:  file
            }))
        });
        try {
            await _compile(options, cb);
        }
        catch (e) {
            console.error(e);
            return process.exit(1);
        }
    });
}

module.exports = markupCompiler;