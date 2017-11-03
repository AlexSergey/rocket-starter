const { existsSync, readFileSync } = require('fs');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');
const ImageminPlugin = require('imagemin-webpack-plugin').default;
const CleanWebpackPlugin = require('clean-webpack-plugin');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const ExtractTextPlugin  = require('extract-text-webpack-plugin');
const moment = require('moment');
const { argv } = require('yargs');
const Collection = require('./Collection');

function getArgs() {
    return argv;
}

function getBuildVersion() {
    return moment().format('DDMM-hhmm');
}

function getWebpack() {
    return webpack;
}

function getTitle(packageJson) {
    return `${packageJson.name} ${packageJson.version}`;
}

function makeBanner(packageJson) {
    let banner = existsSync(path.resolve(__dirname, '..', './banner'))
        ? readFileSync(path.resolve(__dirname, '..', './banner'), 'utf8')
        : '';

    if (!!banner) {
        let types = ['name', 'version', 'author', 'email', 'description', 'license'];

        types.forEach(type => {
            if (banner.indexOf(type) > 0 && !!packageJson[type]) {
                banner = banner.replace(`$\{${type}\}`, packageJson[type]);
            }
        });
        types.forEach(type => banner = banner.replace(`$\{${type}\}`, ""));

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

function getDevtool(customSourceMap = 'none') {
    let sourceMap = process.env.NODE_ENV === 'development' ? 'source-map' : false;

    sourceMap = customSourceMap === 'none' ? sourceMap : customSourceMap;
    return {
        devtool: sourceMap
    }
}

function getOutput(props = {}) {
    let outputProps = {
        output: {
            publicPath: props.publicPath || '/',
            path: props.path || path.resolve(__dirname, 'dist'),
            filename: props.filename || `[name].js`
        }
    };

    if (props.library) {
        Object.assign(outputProps.output, {
            library: props.library,
            libraryTarget: props.libraryTarget || 'umd'
        });
    }

    return outputProps;
}

function getModules() {
    let isNotProduction = process.env.NODE_ENV !== 'production';

    return {
        html: {
            test: /\.html$/,
            use: 'file-loader?name=[name].[ext]'
        },

        css: isNotProduction ? {
            test: /\.css$/,
            loader: [
                'style-loader',
                'css-loader'
            ]
        } : {
            test: /\.css$/,
            use: ExtractTextPlugin.extract({
                fallback: "style-loader",
                use: { loader: 'css-loader', options: { minimize: true }}
            })
        },

        scss: isNotProduction ? {
            test: /\.scss/,
            loader: [
                'style-loader',
                'css-loader',
                'sass-loader'
            ]
        } : {
            test: /\.scss/,
            use: ExtractTextPlugin.extract({
                fallback: "style-loader",
                use: [
                    { loader: 'css-loader', options: { minimize: true }},
                    'sass-loader'
                ]
            })
        },

        less: isNotProduction ? {
            test: /\.less/,
            loader: [
                'style-loader',
                'css-loader',
                'less-loader'
            ]
        } : {
            test: /\.less/,
            use: ExtractTextPlugin.extract({
                fallback: "style-loader",
                use: [
                    { loader: 'css-loader', options: { minimize: true }},
                    'less-loader'
                ]
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
                        ],
                        env: {
                            production: {
                                plugins: [
                                    require.resolve('babel-plugin-transform-react-constant-elements'),
                                    require.resolve('babel-plugin-transform-react-inline-elements'),
                                    require.resolve('babel-plugin-transform-react-pure-class-to-function'),
                                    require.resolve('babel-plugin-transform-react-remove-prop-types'),
                                ]
                            }
                        }
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
    let isProduction = process.env.NODE_ENV === 'production';

    let modules = {
        OccurrenceOrderPlugin: () => new webpack.optimize.OccurrenceOrderPlugin(),
        HtmlWebpackPlugin: (props = {
            title: 'app',
            version: 1,
            template: path.resolve(__dirname, '..', './index.ejs')
        }) => new HtmlWebpackPlugin(props),
        DefinePlugin: (vars = {}) => new webpack.DefinePlugin(Object.assign({
            'process.env': {
                NODE_ENV: JSON.stringify(process.env.NODE_ENV)
            }
        }, vars))
    };

    if (isProduction) {
        Object.assign(modules, {
            ModuleConcatenationPlugin: (props = {}) => new webpack.optimize.ModuleConcatenationPlugin(),
            ExtractTextPlugin: (props = {}) => new ExtractTextPlugin(props.path || 'css/styles.css'),
            ImageminPlugin: (props = {}) => new ImageminPlugin({
                disable: false,
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

            UglifyJSPlugin: (props = {}) => new UglifyJSPlugin({
                sourceMap: false,
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

            BannerPlugin: ({banner}) => new webpack.BannerPlugin(!banner ? '' : banner)
        })
    }

    return modules;
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

function getDevServer(props = {}) {
    return {
        devServer: {
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
                "Access-Control-Allow-Headers": "X-Requested-With, content-type, Authorization"
            },
            port: props.port || 3000,
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
            host: props.host || 'localhost'
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

function getNode(modules = {}) {
    return {
        node: Object.assign({
            fs: 'empty'
        }, modules)
    }
}

function makeModules(modules, props = {}) {
    return new Collection({
        data: modules,
        props
    });
}

function makePlugins(plugins, props = {}) {
    return new Collection({
        data: plugins,
        props
    });
}

module.exports = {
    getArgs,
    getBuildVersion,
    getWebpack,
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
    makeModules,
    makePlugins
}