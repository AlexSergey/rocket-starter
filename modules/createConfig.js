const OpenBrowserPlugin = require('open-browser-webpack-plugin');
const { getEntry, getDevtool, getOutput, makeModules, getModules, makePlugins, getPlugins, getStats, getDevServer, getNode, getResolve } = require('./configGenerators');
const { isArray, isObject, isFunction } = require('./typeChecker');

function createConfig(
    props = {},
    middlewares = {
        pre: [],
        post: []
    }, externalProps = {}) {
    
    if (middlewares.pre) {
        if (isArray(middlewares.pre) && middlewares.pre.length > 0) {
            middlewares.forEach(middleware => {
                let _props = middleware(props, externalProps);
                props = isObject(_props) || props;
            })
        }
        else if (isFunction(middlewares.pre)) {
            let _props = middlewares.pre(props, externalProps);
            props = isObject(_props) || props;
        }
    }

    let {
        entry = getEntry(),
        devtool = getDevtool(),
        output = getOutput(),
        modules = makeModules(getModules()),
        plugins = makePlugins(getPlugins()),
        externals = [],
        stats = getStats(),
        devServer = getDevServer(),
        node = getNode(),
        resolve = getResolve()
    } = props;

    let config = {
        cache: true
    };

    Object.assign(config, entry, devtool, output, stats, node, resolve, devServer);

    if (modules) {
        config.module = {};
        config.module.rules = modules.get();
    }

    config.plugins = plugins.get();
    config.externals = externals;

    if (devServer && devServer.devServer && devServer.devServer.host && devServer.devServer.port) {
        config.plugins.push(new OpenBrowserPlugin({ url: `http://${devServer.devServer.host}:${devServer.devServer.port}` }));
    }

    if (middlewares.post) {
        if (isArray(middlewares.post) && middlewares.post.length > 0) {
            middlewares.forEach(middleware => {
                let _config = middleware(config, externalProps);
                config = isObject(_config) || config;
            })
        }
        else if (isFunction(middlewares.post)) {
            let _config = middlewares.post(config, externalProps);
            config = isObject(_config) || config;
        }
    }

    return config;
}

module.exports = createConfig;