const log = require('../utils/log');
const { isNumber, isArray } = require('valid-types');
const WebpackDevServer = require('webpack-dev-server');
const open = require("open");
const BrowserSyncPlugin = require('browser-sync-webpack-plugin');

function runDevServer(compiler, webpackConfig, conf) {
    let server = new WebpackDevServer(compiler, webpackConfig.devServer);

    server.listen(webpackConfig.devServer.port, webpackConfig.devServer.host, () => {
        if (isNumber(conf._liveReloadPort)) {
            console.log(`LiveReload server on http://localhost:${conf._liveReloadPort}`);
        }
        console.log(`Starting server on http://${webpackConfig.devServer.host}:${webpackConfig.devServer.port}/`);
        if (!!conf.analyzerPort) {
            console.log(`Bundle analyzer ran http://localhot:${conf.analyzerPort}/`);
        }
        if (conf.html) {
            open(`http://${webpackConfig.devServer.host}:${webpackConfig.devServer.port}/`);
        }
    });
}

const runAppStrategy = (compiler, webpack, webpackConfig, conf) => {
    return {
        simple: () => {
            compiler.run((err, stats) => {
                log(err, stats);
                if (isNumber(conf._liveReloadPort)) {
                    console.log(`LiveReload server on http://localhost:${conf._liveReloadPort}`);
                }
                process.exit(err ? 1 : 0);
            });
        },
        'browser-sync': () => {
            runDevServer(compiler, webpackConfig, conf);
        },
        'dev-server': () => {
            runDevServer(compiler, webpackConfig, conf);
        },
        'watch': () => {
            compiler.watch({}, (err, stats) => {
                console.log(stats.toString({
                    "errors-only": true,
                    colors: true,
                    children: false
                }));
            });
        }
    };
};

const runNodeStrategy = (compiler) => {
    return {
        simple: () => {
            compiler.run((err, stats) => {
                log(err, stats);

                process.exit(err ? 1 : 0);
            });
        },
        'node-watch': () => {
            compiler.watch({}, (err, stats) => {
                console.log(stats.toString({
                    "errors-only": true,
                    colors: true,
                    children: false
                }));
            });
        }
    }
};

const _getStrategy = (mode, conf) => {
    if (conf.onlyWatch) {
        return conf.nodejs ? 'node-watch' : 'watch';
    }
    switch(mode) {
        case 'development':
            if (conf.nodejs) {
                return 'node-watch';
            }
            else if (conf.server && isNumber(conf.server.browserSyncPort)) {
                return 'browser-sync';
            }
            return 'dev-server';

        default:
            return 'simple';
    }
};

const run = (webpackConfig, mode, webpack, conf) => {
    process.env.NODE_ENV = mode;
    process.env.BABEL_ENV = mode;

    if (isArray(webpackConfig)) {
        webpackConfig.forEach((webpackConfig, index) => {
            conf[index].strategy = _getStrategy(mode, conf[index]);
        });

        conf.forEach((conf, index) => {
            if (conf.strategy === 'browser-sync') {
                webpackConfig[index].plugins.push(new BrowserSyncPlugin(
                    {
                        port: conf.server.browserSyncPort,
                        proxy: `http://${webpackConfig.devServer.host}:${webpackConfig.devServer.port}`
                    },
                    { reload: false }
                ));
            }
        });

        let compiler = webpack(webpackConfig);

        conf.forEach((conf, index) => {
            let compileStrategy;

            if (conf.nodejs) {
                compileStrategy = runNodeStrategy(compiler.compilers[index], webpack, webpackConfig[index], conf)[conf.strategy];
            }
            else {
                compileStrategy = runAppStrategy(compiler.compilers[index], webpack, webpackConfig[index], conf)[conf.strategy];
            }

            compileStrategy();
        });
    }
    else {
        let compileStrategy;

        let strategy = _getStrategy(mode, conf);

        if (strategy === 'browser-sync') {
            webpackConfig.plugins.push(new BrowserSyncPlugin(
                {
                    port: conf.server.browserSyncPort,
                    proxy: `http://${webpackConfig.devServer.host}:${webpackConfig.devServer.port}`
                },
                { reload: false }
            ));
        }
        let compiler = webpack(webpackConfig);

        if (!strategy) {
            console.log('strategy is empty');
            return false;
        }

        if (conf.nodejs) {
            compileStrategy = runNodeStrategy(compiler, webpack, webpackConfig, conf)[strategy];
        }
        else {
            compileStrategy = runAppStrategy(compiler, webpack, webpackConfig, conf)[strategy];
        }

        if (!compileStrategy) {
            console.log('compileStrategy is empty');
            return false;
        }

        compileStrategy();
    }
};

module.exports = run;
