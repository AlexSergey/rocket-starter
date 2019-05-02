let { isArray } = require('valid-types');
let path = require('path');

const _getSrc = (src, root) => {
    let result = isArray(src) ? src.map(p => path.resolve(root, p)) : path.resolve(root, src);
    return result;
};

const makeEntry = (conf, root, mode) => {
    let s = _getSrc(conf.src, root);

    if (!conf.nodejs) {
        if (mode === 'development') {
            if (isArray(s)) {
                return [`${require.resolve('webpack-dev-server/client')}?http://${conf.server.host}:${conf.server.port}/`, require.resolve('webpack/hot/dev-server')].concat(s);
            }

            return [`${require.resolve('webpack-dev-server/client')}?http://${conf.server.host}:${conf.server.port}/`, require.resolve('webpack/hot/dev-server'), s]
        }
    }

    return s;
};

module.exports = makeEntry;