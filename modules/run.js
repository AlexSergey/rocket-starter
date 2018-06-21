const log = require('../utils/log');
const historyApiFallback = require('connect-history-api-fallback');
const serve = require('webpack-serve');
const convert = require('koa-connect');
const webpackServeWaitpage = require('webpack-serve-waitpage');

const getStrategy = (webpack, webpackConfig, conf) => {
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
            let compiler = webpack(webpackConfig);
            serve({
                watchOptions: webpackConfig.devServer.watchOptions,
                add: (app, middleware, options) => {
                    app.use(webpackServeWaitpage(options));
                    app.use(convert(historyApiFallback()));
                    middleware.webpack();
                    middleware.content();

                },
                dev: {
                    publicPath: webpackConfig.output.publicPath,
                    writeToDisk: conf.debug
                },
                open: true,
                host: webpackConfig.devServer.host,
                port: webpackConfig.devServer.port,
                hot: webpackConfig.devServer.hot,
                compiler,

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