const log = require('../utils/log');
const { isNumber } = require('../utils/typeChecker');
const WebpackDevServer = require('webpack-dev-server');
const open = require("open");
const BrowserSyncPlugin = require('browser-sync-webpack-plugin');

const getAppStrategy = (webpack, webpackConfig, conf) => {
    return {
        simple: () => {
            let compiler = webpack(webpackConfig);
            compiler.run((err, stats) => {
                log(err, stats);

                process.exit(err ? 1 : 0);
            });
        },
        'dev-server': () => {
            if (isNumber(conf.server.browserSyncPort)) {
                webpackConfig.plugins.push(new BrowserSyncPlugin(
                    {
                        port: conf.server.browserSyncPort,
                        proxy: `http://${webpackConfig.devServer.host}:${webpackConfig.devServer.port}`
                    },
                    { reload: false }
                ));

                let compiler = webpack(webpackConfig);
                let server = new WebpackDevServer(compiler, webpackConfig.devServer);

                server.listen(webpackConfig.devServer.port, webpackConfig.devServer.host, () => {
                    console.log(`Starting server on http://${webpackConfig.devServer.host}:${webpackConfig.devServer.port}/`);
                });
            }
            else {
                let compiler = webpack(webpackConfig);
                let server = new WebpackDevServer(compiler, webpackConfig.devServer);

                server.listen(webpackConfig.devServer.port, webpackConfig.devServer.host, () => {
                    console.log(`Starting server on http://${webpackConfig.devServer.host}:${webpackConfig.devServer.port}/`);
                    open(`http://${webpackConfig.devServer.host}:${webpackConfig.devServer.port}/`);
                });
            }
        }
    };
};

const getNodeStrategy = (webpack, webpackConfig, conf) => {
    return {
        simple: () => {
            let compiler = webpack(webpackConfig);
            compiler.run((err, stats) => {
                log(err, stats);

                process.exit(err ? 1 : 0);
            });
        },
        'dev-server': () => {
            let compiler = webpack(webpackConfig);
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

const run = (webpackConfig, mode, webpack, conf) => {
    process.env.NODE_ENV = mode;
    process.env.BABEL_ENV = mode;

    let strategy = mode === 'development' ? 'dev-server' : 'simple';

    if (!strategy) {
        console.log('strategy is empty');
        return false;
    }

    let compileStrategy;

    if (conf.nodejs) {
        compileStrategy = getNodeStrategy(webpack, webpackConfig, conf)[strategy];
    }
    else {
        compileStrategy = getAppStrategy(webpack, webpackConfig, conf)[strategy];
    }

    if (!compileStrategy) {
        console.log('compileStrategy is empty');
        return false;
    }
    return compileStrategy();
};

module.exports = run;