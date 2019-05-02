const webpack = require('webpack');
const { argv } = require('yargs');
const { babelOpts } = require('./modules/makeModules');
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
    babelOpts,
    markupCompiler,
    libraryCompiler,
    frontendCompiler,
    backendCompiler
};
