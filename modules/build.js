const path = require('path');
const { validationProps } = require('./validation');
const { isArray } = require('./typeChecker');
const { getEntry, getDevtool, getOutput, makePlugins, getPlugins, getDevServer, makeModules, getModules, getStats, getNode, getResolve } = require('./configGenerators');
const createConfig = require('./createConfig');
const ExtractTextPlugin  = require('extract-text-webpack-plugin');
const mixedWithDefault = require('./mixWithDefault');

const build = props => {
    props = mixedWithDefault(props);

    let isValid = validationProps(props);

    if (!isValid.state) {
        console.log(isValid.message);
        return false;
    }
    let entry = getEntry(isArray(props.src) ?
        props.src.map(p => path.resolve(props.root, p)) :
        path.resolve(props.root, props.src));

    let output = getOutput({
        path: path.resolve(props.root, props.dist),
        library: props.library
    }, props.build_version);

    let devtool = getDevtool(props.sourcemap);

    let needToIncludeSourcemaps = !!devtool.devtool;

    let forProductionPlugins = process.env.NODE_ENV === 'production' ? Object.assign({
        UglifyJSPlugin: {
            sourceMap: needToIncludeSourcemaps
        }
    }, (props.styles ? {
        ExtractTextPlugin: {
            styles: props.styles,
            build_version: props.build_version
        }
    } : {})) : {};

    let excludePlugins = [];

    if (!props.banner) {
        excludePlugins.push('BannerPlugin');
    }

    if (props.library) {
        excludePlugins.push('HtmlWebpackPlugin');
    }
    if (!props.styles) {
        excludePlugins.push('ExtractTextPlugin');
    }

    let plugins = makePlugins(
        getPlugins({
            analyzer: props.analyzer
        }),
        Object.assign({
            CleanWebpackPlugin: {
                path: path.resolve(props.root, props.dist),
                root: props.root
            },
            BannerPlugin: {
                banner: props.banner
            },
            HtmlWebpackPlugin: props.html,
            DefinePlugin: props.global
        }, forProductionPlugins),
        excludePlugins
    );

    let devServer = getDevServer(props.server);

    let modules = makeModules(getModules({
            extractStyles: !!props.styles,
            sourcemap: needToIncludeSourcemaps
        })),
        externals = [],
        stats = getStats(),
        node = getNode(),
        resolve = getResolve();

    return createConfig({
        modules,
        externals,
        stats,
        node,
        resolve,
        entry,
        output,
        plugins,
        devtool,
        devServer,
    }, props.middlewares, props);
};

module.exports = {
    build
};