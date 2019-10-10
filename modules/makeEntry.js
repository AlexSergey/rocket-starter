let { isArray, isObject } = require('valid-types');
let path = require('path');

const _getSrc = (src, root) => {
    if (isArray(src)) {
        return src.map(p => path.resolve(root, p));
    }
    else if (isObject(src)) {
        Object.keys(key => {
            src[key] = path.resolve(root, src[key]);
        });
        return src;
    }
    return path.resolve(root, src);
};

const makeEntry = (conf, root, mode) => {
    let s = _getSrc(conf.src, root);

    if (!conf.nodejs) {
        if (mode === 'development') {
            if (isArray(s)) {
                return [`${require.resolve('webpack-dev-server/client')}?http://${conf.server.host}:${conf.server.port}/`, require.resolve('webpack/hot/dev-server')].concat(s);
            }
            else if (isObject(s)) {
                s['dev-server-client'] = `${require.resolve('webpack-dev-server/client')}?http://${conf.server.host}:${conf.server.port}/`;
                s['dev-server-hot'] = require.resolve('webpack/hot/dev-server');
                return s;
            }

            return [`${require.resolve('webpack-dev-server/client')}?http://${conf.server.host}:${conf.server.port}/`, require.resolve('webpack/hot/dev-server'), s]
        }
    }

    return s;
};

module.exports = makeEntry;
