let { isArray } = require('../utils/typeChecker');
let path = require('path');

const _getSrc = (src, root) => {
    let result = isArray(src) ? src.map(p => path.resolve(root, p)) : path.resolve(root, src);
    return result;
};

const makeEntry = (conf, root) => {
    return _getSrc(conf.src, root);
};

module.exports = makeEntry;