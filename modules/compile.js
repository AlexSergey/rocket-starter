const { build } = require('./build');
const { getWebpack } = require('./configGenerators');
const WebpackDevServer = require('webpack-dev-server');
const gutil = require('gutil');
const moment = require('moment');

const log = (err, stats) => {
    if (err) { throw new gutil.PluginError('webpack:build', err); }
    let duration = moment.duration(stats.endTime - stats.startTime, 'milliseconds');
    gutil.log('[COMPILE]', `${duration.minutes()}:${duration.seconds()} minutes`);
};

const getStrategy = (config) => {
    const webpack = getWebpack();
    return {
        simple: () => {
            let compiler = webpack(config);
            compiler.run(log);
        },
        'watch-only': () => {
            let compiler = webpack(config);
            compiler.watch(Object.assign({
                poll: true
            }, config.devServer.watchOptions), log)
        },
        'dev-server': () => {
            config.entry.unshift(`webpack-dev-server/client?http://${config.devServer.host}:${config.devServer.port}/`);
            let compiler = webpack(config);
            let server = new WebpackDevServer(compiler, config.devServer);
            server.listen(config.devServer.port, config.devServer.host, () => {
                console.log(`Starting server on http://${config.devServer.host}:${config.devServer.port}/`);
            });
        }
    }
};

const compile = (props = {}) => {
    process.env.NODE_ENV = process.env.NODE_ENV || 'development';
    process.env.BABEL_ENV = process.env.NODE_ENV;

    const config = build(props);
    let strategy = '';
    let itsLibrary = !!config.output.library;

    if (process.env.NODE_ENV === 'production') {
        strategy = 'simple';
    }
    else if (process.env.NODE_ENV === 'development') {
        if (itsLibrary) {
            strategy = 'watch-only';
        }
        else {
            strategy = 'dev-server';
        }
    }

    if (!strategy) {
        console.log('strategy is empty');
        return false;
    }
    let compileStrategy = getStrategy(config)[strategy];
    if (!compileStrategy) {
        console.log('compileStrategy is empty');
        return false;
    }
    return compileStrategy();
};

module.exports = {
    compile: compile
};