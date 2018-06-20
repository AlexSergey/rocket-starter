const log = require('../utils/log');
const WebpackDevServer = require('webpack-dev-server');
const OpenBrowserPlugin = require('open-browser-webpack-plugin');
const BrowserSyncPlugin = require('browser-sync-webpack-plugin');
const historyApiFallback = require('connect-history-api-fallback');

const getStrategy = (webpack, webpackConfig) => {
    return {
        simple: () => {
            let compiler = webpack(webpackConfig);
            compiler.run((err, stats) => {
                log(err, stats);

                process.exit(err ? 1 : 0);
            });
        },
        'watch-only': () => {
            let compiler = webpack(webpackConfig);
            compiler.watch(
                Object.assign(
                    {},
                    webpackConfig.devServer.watchOptions, {
                        poll: true
                    }
                ),
                log
            );
        },
        'dev-server': () => {
            webpackConfig.plugins.push(new OpenBrowserPlugin({ url: `http://${webpackConfig.devServer.host}:${webpackConfig.devServer.port}` }));
            let compiler = webpack(webpackConfig);
            let server = new WebpackDevServer(compiler, webpackConfig.devServer);

            server.listen(webpackConfig.devServer.port, webpackConfig.devServer.host, () => {
                console.log(`Starting server on http://${webpackConfig.devServer.host}:${webpackConfig.devServer.port}/`);
            });
        },
        'dev-server-with-browser-sync': () => {
            webpackConfig.plugins.push(new OpenBrowserPlugin({ url: `http://${webpackConfig.devServer.host}:${webpackConfig.devServer.port}` }));
            webpackConfig.plugins.push(
                new BrowserSyncPlugin({
                        host: webpackConfig.devServer.host,
                        port: webpackConfig.devServer.port,
                        server: {
                            baseDir: [webpackConfig.output.path],
                            middleware: [ historyApiFallback() ]
                        }
                    },
                    {
                        reload: false
                    })
            );
            let compiler = webpack(webpackConfig);
            let server = new WebpackDevServer(compiler, webpackConfig.devServer);

            server.listen(webpackConfig.devServer.port, webpackConfig.devServer.host, () => {
                console.log(`Starting server on http://${webpackConfig.devServer.host}:${webpackConfig.devServer.port}/`);
            });
        }
    };
};

const run = (webpackConfig, mode, webpack, conf) => {
    process.env.NODE_ENV = mode;
    process.env.BABEL_ENV = mode;

    let strategy = '';
    let itsLibrary = !!webpackConfig.output.library;

    if (mode === 'development') {
        if (itsLibrary) {
            strategy = 'watch-only';
        }
        else {
            strategy = 'dev-server';
            if (conf.server.browserSync) {
                strategy = 'dev-server-with-browser-sync';
            }
        }
    }
    else {
        strategy = 'simple';
    }

    if (!strategy) {
        console.log('strategy is empty');
        return false;
    }

    let compileStrategy = getStrategy(webpack, webpackConfig, conf)[strategy];

    if (!compileStrategy) {
        console.log('compileStrategy is empty');
        return false;
    }
    return compileStrategy();
};

module.exports = run;