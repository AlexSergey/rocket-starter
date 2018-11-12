const webpack = require('webpack');
const path = require('path');
const { existsSync } = require('fs');
const makeMode = require('./modules/makeMode');
const makeEntry = require('./modules/makeEntry');
const makeOutput = require('./modules/makeOutput');
const makeVersion = require('./modules/makeVersion');
const mergeConfWithDefault = require('./modules/mergeConfWithDefault');
const makeDevtool = require('./modules/makeDevtool');
const makeModules = require('./modules/makeModules');
const makePlugins = require('./modules/makePlugins');
const makeResolve = require('./modules/makeResolve');
const makeDevServer = require('./modules/makeDevServer');
const compileWebpackConfig = require('./modules/compileWebpackConfig');
const run = require('./modules/run');
const { isFunction } = require('./utils/typeChecker');
const { argv } = require('yargs');

const make = async (conf, post) => {
    let mode = makeMode();
    const root = path.dirname(require.main.filename);
    const packageJson = existsSync(path.resolve(root, 'package.json')) ? require(path.resolve(root, 'package.json')) : {};
    conf = await mergeConfWithDefault(conf, mode);
    const version = makeVersion(conf);
    let entry = makeEntry(conf, root, mode);
    let output = makeOutput(conf, root, version);
    let devtool = makeDevtool(mode, conf);
    let devServer = makeDevServer(conf, root);
    let modules = makeModules(conf, root, packageJson, mode);
    let plugins = makePlugins(conf, root, packageJson, mode, webpack, version);
    let resolve = makeResolve();

    let finalConfig = {
        entry,
        output,
        devtool,
        devServer,
        resolve
    };

    if (conf.nodejs) {
        finalConfig.target = 'node';

        if (mode === 'development') {
            finalConfig.watch = true;
        }
    }

    if (isFunction(post)) {
        post(finalConfig, modules, plugins);
    }
    let webpackConfig = compileWebpackConfig(finalConfig, conf, mode, root, modules, plugins);

    return webpackConfig;
};

const compile = async (conf = {}, post) => {
    let mode = makeMode();
    const root = path.dirname(require.main.filename);
    conf = await mergeConfWithDefault(conf, mode);
    conf.progress = true;
    const webpackConfig = await make(conf, post);
    run(webpackConfig, mode, webpack, conf);
};

function getArgs() {
    return argv;
}

function getWebpack() {
    return webpack;
}

module.exports = {
    getWebpack,
    compile,
    make,
    getArgs
};
