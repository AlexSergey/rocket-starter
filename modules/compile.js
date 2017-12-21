const { build } = require('./build');
const { getWebpack } = require('./configGenerators');
const { dirname, resolve } = require('path');
const { writeFileSync } = require('fs');
const WebpackDevServer = require('webpack-dev-server');
const gutil = require('gutil');
const moment = require('moment');
const getPort = require('get-port');
const OpenBrowserPlugin = require('open-browser-webpack-plugin');

const log = (err, stats) => {
    if (err) { throw new gutil.PluginError('webpack:build', err); }
    let duration = moment.duration(stats.endTime - stats.startTime, 'milliseconds');
    gutil.log('[COMPILE]', `${duration.minutes()}:${duration.seconds()} minutes`);

    if (process.env.NODE_ENV === 'production') {
        const root = dirname(require.main.filename);

        writeFileSync(`${resolve(root, 'stats.json')}`, JSON.stringify(stats.toJson('normal')));
    }
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
            getPort({port: config.devServer.port})
                .then(port => {
                    config.entry.unshift(`webpack-dev-server/client?http://${config.devServer.host}:${port}/`);
                    config.entry.unshift('webpack/hot/dev-server');
                    config.plugins.push(new OpenBrowserPlugin({ url: `http://${config.devServer.host}:${port}` }));

                    let compiler = webpack(config);
                    let server = new WebpackDevServer(compiler, config.devServer);


                    server.listen(port, config.devServer.host, () => {
                        console.log(`Starting server on http://${config.devServer.host}:${port}/`);
                    });
                })
                .catch(err => {
                    console.log(err);
                })
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