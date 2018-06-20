const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const path = require('path');

const compileWebpackConfig = (finalConfig, conf, mode, root, modules, plugins) => {
    let webpackConfig = {
        mode: mode
    };

    Object.keys(finalConfig).forEach(p => {
        webpackConfig[p] = finalConfig[p];
    });

    webpackConfig.optimization = {};

    if (mode === 'production') {
        webpackConfig.optimization.minimizer = [
            new UglifyJsPlugin({
                cache: conf.cache ? path.join(conf.cache, 'parallel-uglify') : path.join(root, 'node_modules', '.cache', 'parallel-uglify'),
                sourceMap: conf.debug,
                parallel: true,
                uglifyOptions: {
                    output: {
                        comments: new RegExp('banner'),
                        beautify: false
                    },
                    compress: {
                        drop_console: !conf.debug,
                        drop_debugger: !conf.debug
                    },
                    exclude: [/\.min\.js$/gi]
                }
            })
        ]
    }
    if (modules) {
        webpackConfig.module = {};
        webpackConfig.module.rules = modules.get();
    }

    if (plugins) {
        webpackConfig.plugins = {};
        webpackConfig.plugins = plugins.get();
    }

    return webpackConfig;
};

module.exports = compileWebpackConfig;
