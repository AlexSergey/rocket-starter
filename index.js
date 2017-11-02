const { existsSync, readFileSync } = require('fs')
const ImageminPlugin = require('imagemin-webpack-plugin').default;
const CleanWebpackPlugin = require('clean-webpack-plugin');
const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const ExtractTextPlugin  = require('extract-text-webpack-plugin');
const moment = require('moment');
const { argv } = require('yargs');

function getArgs() {
    return argv;
}

function getBuildVersion() {
    return moment().format('DDMM-hhmm');
};

function getWebpack() {
    return webpack;
}

function getTitle(packageJson) {
    return `${packageJson.name} ${packageJson.version}`;
};

function makeBanner(packageJson) {
    var banner = existsSync('./banner')
        ? readFileSync('./banner', 'utf8')
        : '';

    if (!!banner) {
        let types = ['name', 'version', 'author', 'email', 'description', 'license'];

        types.forEach(type => {
            if (banner.indexOf(type) > 0 && !!packageJson[type]) {
                banner = banner.replace(`$\{${type}\}`, packageJson[type]);
            }
        })
        types.forEach(type => {
            banner = banner.replace(`$\{${type}\}`, "");
        });
        banner = banner.split('\n').filter(item => item !== '\r' && item !== '\n').join('');

        return banner;
    }
    else {
        return false;
    }
}

function getEntry(entry = './source/index.js') {
    return {
        entry: entry
    }
}

function getDevtool(isDevelopment = false) {
    return {
        devtool: isDevelopment ? 'source-map' : false
    }
}

function getOutput(props = {}) {
    return {
        output: {
            publicPath: props.publicPath || '/',
            path: props.path || path.resolve(__dirname, 'dist'),
            filename: props.filename || `[name].js`
        }
    }
}

function getModules() {
    return {
        html: {
            test: /\.html$/,
            use: 'file-loader?name=[name].[ext]'
        },

        css: {
            test: /\.css$/,
            use: ExtractTextPlugin.extract({
                fallback: "style-loader",
                use: { loader: 'css-loader', options: { minimize: true }}
            })
        },

        js: {
            test: /\.(js|jsx)$/,
            exclude: /node_modules/,
            use: [
                {
                    loader: 'babel-loader',
                    query: {
                        cacheDirectory: true,
                        babelrc: false,
                        presets: [[
                            require.resolve('babel-preset-es2015'), {
                                modules: false
                            }
                        ],  require.resolve('babel-preset-stage-0'),
                            require.resolve('babel-preset-react')
                        ],
                        plugins: [
                            require.resolve('babel-plugin-transform-decorators-legacy')
                        ]
                    }
                }
                /*{
                    loader: 'eslint-loader',
                    options: {
                        emitErrors: true,
                        failOnError: true,
                        failOnWarning: true
                    }
                }*/
            ]
        },

        images: {
            test: /\.(jpe?g|png|gif)$/i,
            loaders: ['url-loader?limit=10000&name=images/[name].[ext]']
        },

        fonts: {
            test: /\.(woff(2)?)(\?[a-z0-9=&.]+)?$/,
            loader: 'url-loader?limit=10000&name=fonts/[name].[ext]'
        },

        markdown: {
            test: /\.md$/,
            loader: 'html-loader!markdown-loader'
        },

        json: {
            test: /\.json/,
            loader: 'json-loader'
        },

        svg: {
            test: /\.svg$/,
            use: [
                {
                    loader: 'svg-inline-loader'
                },
                {
                    loader: 'svgo-loader',
                    options: {
                        plugins: [
                            { removeTitle: true },
                            { convertColors: { shorthex: false } },
                            { convertPathData: false }
                        ]
                    }
                }
            ]
        }
    };
}

function getPlugins() {
    return {
        ModuleConcatenationPlugin: (props = {}) => new webpack.optimize.ModuleConcatenationPlugin(),
        ExtractTextPlugin: (props = {}) => new ExtractTextPlugin(props.path || 'css/styles.css'),
        ImageminPlugin: (props = {}) => new ImageminPlugin({
            disable: props.disable,
            optipng: {
                optimizationLevel: 3
            },
            gifsicle: {
                optimizationLevel: 1
            },
            jpegtran: {
                progressive: false
            },
            svgo: {
            },
            pngquant: null,
            plugins: []
        }),
        CleanWebpackPlugin: (props = {}) => new CleanWebpackPlugin([props.path || './dist'], {root: props.root || __dirname}),
        OccurrenceOrderPlugin: () => new webpack.optimize.OccurrenceOrderPlugin(),
        UglifyJSPlugin: (props = {}) => new UglifyJSPlugin({
            sourceMap: props.sourceMap || true,
            uglifyOptions: {
                ie8: false,
                ecma: 5,
                output: {
                    comments: false,
                    beautify: false,
                },
                warnings: false
            }
        }),
        HtmlWebpackPlugin: (props = {}) => new HtmlWebpackPlugin({
            title: props.title || 'app',
            version: props.version || 1,
            template: props.path || './index.ejs'
        }),
        DefinePlugin: (vars = {}) => new webpack.DefinePlugin(Object.assign({
            'process.env': {
                NODE_ENV: JSON.stringify(process.env.NODE_ENV)
            }
        }, vars))
    }
}

function getStats() {
    return {
        stats: {
            hash: true,
            version: true,
            timings: true,
            assets: true,
            chunks: true,
            modules: true,
            reasons: true,
            children: true,
            source: false,
            errors: true,
            errorDetails: true,
            warnings: true,
            publicPath: true
        }
    }
}

function getDevServer(host = 'localhost', port = 3000) {
    return {
        devServer: {
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
                "Access-Control-Allow-Headers": "X-Requested-With, content-type, Authorization"
            },
            port: port,
            noInfo: true,
            quiet: false,
            lazy: false,
            inline: true,
            stats: "minimal",
            overlay: {
                errors: true
            },
            watchOptions: {
                aggregateTimeout: 50,
                ignored: /node_modules/
            },
            historyApiFallback: true,
            host: host
        }
    }
}

function getResolve() {
    return {
        resolve: {
            extensions: ['.js', '.jsx']
        }
    }
}

function getNode() {
    return {
        node: {
            fs: 'empty'
        }
    }
}

function makePlugins(plugins, props = {}) {
    return Object.keys(plugins).map(plName => plugins[plName](props[plName]));
}

function createConfig(
    entry = getEntry(),
    devtool = getDevtool(),
    output = getOutput(),
    modules = getModules(),
    plugins = [],
    stats = getStats(),
    devServer = getDevServer(),
    node = getNode(),
    resolve = getResolve(),
    banner
) {
    let config = {};

    Object.assign(config, entry, devtool, output, stats, node, resolve, devServer);

    if (modules) {
        config.module = {};
        config.module.rules = Object.keys(modules).map(module => modules[module]);
    }

    config.plugins = plugins;

    if (banner) {
        config.plugins.push(new webpack.BannerPlugin(banner));
    }

    return config;
}

module.exports = {
    getArgs,
    getWebpack,
    getBuildVersion,
    getTitle,
    makeBanner,
    getEntry,
    getDevtool,
    getOutput,
    getModules,
    getPlugins,
    getStats,
    getDevServer,
    getResolve,
    getNode,
    makePlugins,
    createConfig
};