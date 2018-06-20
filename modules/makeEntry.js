let { isArray } = require('../utils/typeChecker');
let path = require('path');

const _getSrc = (src, root) => {
    let result = isArray(src) ? src.map(p => path.resolve(root, p)) : path.resolve(root, src);
    return result;
};

const makeEntry = (conf, root, mode) => {
    if (mode === 'development') {
        let s = _getSrc(conf.src, root);

        if (isArray(s)) {
            return [`${require.resolve('webpack-dev-server/client')}?http://${conf.server.host}:${conf.server.port}/`, require.resolve('webpack/hot/dev-server')].concat(s);
        }

        return [`${require.resolve('webpack-dev-server/client')}?http://${conf.server.host}:${conf.server.port}/`, require.resolve('webpack/hot/dev-server'), s]
    }
    return _getSrc(conf.src, root);
};

module.exports = makeEntry;