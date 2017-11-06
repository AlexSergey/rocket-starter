const path = require('path');
const { validationProps } = require('./modules/validation');
const { isArray, isObject, isFunction, isString, isBoolean, isUndefined } = require('./modules/typeChecker');
const { getEntry, makeBanner, getWebpack, getDevtool, getOutput, makeModules, getModules, makePlugins, getPlugins, getStats, getTitle, getBuildVersion, getDevServer, getNode, getResolve } = require('./modules/configGenerators');
const createConfig = require('./modules/createConfig');
const ExtractTextPlugin  = require('extract-text-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');

const webpack = getWebpack();

function _build(props) {
    let packageJson = require(path.resolve(props.root, 'package.json'));

    let banner = makeBanner(packageJson, props.root);

    if (props.banner) {
        if (isString(props.banner)) {
            banner = props.banner;
        }
    }
    else {
        if (isBoolean(props.banner)) {
            banner = false;
        }
    }

    let entry = getEntry(path.resolve(props.root, props.src));

    let output = getOutput({
        path: path.resolve(props.root, props.dist)
    });

    let plugins = makePlugins(getPlugins(), Object.assign({
        CleanWebpackPlugin: {
            path: path.resolve(props.root, props.dist),
            root: props.root
        },
        BannerPlugin: {
            banner
        },
        HtmlWebpackPlugin: {
            title: props.html && props.html.title ? props.html.title : getTitle(packageJson),
            version: props.html && !isUndefined(props.html.version) ? props.html.version : getBuildVersion(),
            template: props.html && props.html.path ? props.html.path : path.resolve(__dirname, './index.ejs'),
        },
        DefinePlugin: isObject(props.global) ? props.global : {}
    }));

    if (!banner) {
        plugins.remove('BannerPlugin');
    }
    if (plugins.get('CleanWebpackPlugin')) {
        plugins.set('CleanWebpackPlugin', new CleanWebpackPlugin([props.dist], {root: props.root}));
    }

    let devtool = getDevtool(!isUndefined(props.sourcemap) ? props.sourcemap : 'none'),
        devServer = getDevServer(isObject(props.server) ? props.server : {});

    return {
        entry,
        output,
        plugins,
        devtool,
        devServer
    }
}

let iWantTo = {
    library: props => {
        let isValid = validationProps(props, ['name']);
        if (!isValid.state) {
            console.log(isValid.message);
            return false;
        }
        let {
            entry,
            plugins,
            devtool,
            devServer
        } = _build(props);

        let output = getOutput({
            path: path.resolve(props.root, props.dist),
            library: props.name
        });

        plugins.remove('HtmlWebpackPlugin');

        return createConfig({
            entry,
            output,
            plugins,
            devtool,
            devServer
        }, props.middlewares, props);
    },

    app: props => {
        let isValid = validationProps(props);
        if (!isValid.state) {
            console.log(isValid.message);
            return false;
        }

        let {
            entry,
            output,
            plugins,
            devtool,
            devServer
        } = _build(props);

        if (props.styles) {
            if (plugins.get('ExtractTextPlugin')) {
                plugins.set('ExtractTextPlugin', new ExtractTextPlugin(props.styles));
            }
        }

        return createConfig({
            entry,
            output,
            plugins,
            devtool,
            devServer
        }, props.middlewares, props);
    }
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
    iWantTo,
    customize,
    getWebpack
};