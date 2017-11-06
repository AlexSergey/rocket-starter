const path = require('path');
const { validationProps } = require('./validation');
const { isArray, isObject, isFunction } = require('./typeChecker');
const { getEntry, getDevtool, getOutput, makePlugins, getPlugins, getDevServer } = require('./configGenerators');
const createConfig = require('./createConfig');
const ExtractTextPlugin  = require('extract-text-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const mixedWithDefault = require('./mixWithDefault');
const OpenBrowserPlugin = require('open-browser-webpack-plugin');

const build = props => {
    props = mixedWithDefault(props);

    let isValid = validationProps(props);

    if (!isValid.state) {
        console.log(isValid.message);
        return false;
    }
    let entry = getEntry(path.resolve(props.root, props.src));

    let output = getOutput({
        path: path.resolve(props.root, props.dist),
        library: props.library
    });

    let plugins = makePlugins(getPlugins(), Object.assign({
        CleanWebpackPlugin: {
            path: path.resolve(props.root, props.dist),
            root: props.root
        },
        BannerPlugin: {
            banner: props.banner
        },
        HtmlWebpackPlugin: props.html,
        DefinePlugin: props.global
    }));

    if (!props.banner) {
        plugins.remove('BannerPlugin');
    }
    if (plugins.get('CleanWebpackPlugin')) {
        plugins.set('CleanWebpackPlugin', new CleanWebpackPlugin([props.dist], {root: props.root}));
    }

    if (props.library) {
        plugins.remove('HtmlWebpackPlugin');
    }

    if (props.styles) {
        if (plugins.get('ExtractTextPlugin')) {
            plugins.set('ExtractTextPlugin', new ExtractTextPlugin(props.styles));
        }
    }

    if (!props.library && process.env.NODE_ENV === 'development') {
        plugins.add('OpenBrowserPlugin', new OpenBrowserPlugin({ url: `http://${props.server.host}:${props.server.port}` }));
    }

    let devtool = getDevtool(props.sourcemap);

    let devServer = getDevServer(props.server);

    return createConfig({
        entry,
        output,
        plugins,
        devtool,
        devServer,
    }, props.middlewares, props);
};

const customize = (...args) => {
    let props = args[0];
    let middlewares = args[1];

    if (isFunction(middlewares)) {
        props.middlewares = {
            pre: middlewares
        }
    }
    else if (isArray(middlewares)) {
        props.middlewares = {
            pre: middlewares
        }
    }
    else if (isObject(middlewares)) {
        props.middlewares = {
            pre: middlewares.pre,
            post: middlewares.post
        }
    }
    return props;
};

module.exports = {
    build,
    customize
};