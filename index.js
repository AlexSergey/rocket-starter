const webpack = require('webpack');
const { argv } = require('yargs');
const { babelOpts } = require('./modules/makeModules');
const makeWebpackConfig = require('./compilers/makeWebpackConfig');
const markupCompiler = require('./compilers/markupCompiler');
const libraryCompiler = require('./compilers/libraryCompiler');
const frontendCompiler = require('./compilers/frontendCompiler');
const backendCompiler = require('./compilers/backendCompiler');

function getArgs() {
    return argv;
}

function getWebpack() {
    return webpack;
}

module.exports = {
    getWebpack,
    getArgs,
    makeWebpackConfig,
    babelOpts,
    markupCompiler,
    libraryCompiler,
    frontendCompiler,
    backendCompiler
};
