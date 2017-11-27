const { existsSync, readFileSync } = require('fs');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const RuntimeAnalyzerPlugin = require('webpack-runtime-analyzer');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');
const ImageminPlugin = require('imagemin-webpack-plugin').default;
const CleanWebpackPlugin = require('clean-webpack-plugin');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const ExtractTextPlugin  = require('extract-text-webpack-plugin');
const moment = require('moment');
const { argv } = require('yargs');
const { isArray, isObject } = require('./typeChecker');
const Collection = require('./Collection');

function getArgs() {
    return argv;
}

function getBuildVersion() {
    return process.env.ROCKET_BUILD_VERSION ||
        moment().format('DDMM-hhmm');
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
        entry: isArray(entry) ? entry : [entry]
    }
}

function getDevtool(customSourceMap = 'none') {
    let sourceMap = process.env.NODE_ENV === 'development' ? 'source-map' : false;

    sourceMap = customSourceMap === 'none' ? sourceMap : customSourceMap;
    return {
        devtool: sourceMap
    }
}

function getOutput(props = {}, version = '') {
    let outputProps = {
        output: {
            publicPath: '/',
            path: props.path,
            filename: `[name]${version !== '' ? '-' + version : ''}.js`
        }
    };

    if (props.library) {
        Object.assign(outputProps.output, {
            library: props.library,
            libraryTarget: 'umd'
        });
    }

    return outputProps;
}

function getModules(props = {}) {
    let isNotProduction = process.env.NODE_ENV !== 'production';
    let extractStyles = props.extractStyles && process.env.NODE_ENV === 'production';

    return {
        html: {
            test: /\.html$/,
            use: 'file-loader?name=[name].[ext]'
        },

        css: extractStyles ? {
            test: /\.css$/,
            use: ExtractTextPlugin.extract({
                fallback: "style-loader",
                use: { loader: 'css-loader', options: {minimize: true, sourceMap: !!props.sourcemap}}
            })
        } : {
            test: /\.css$/,
            loader: [
                { loader: 'style-loader', options: {sourceMap: !!props.sourcemap}},
                { loader: 'css-loader', options: {sourceMap: !!props.sourcemap}}
            ]
        },

        scss: extractStyles ? {
            test: /\.scss/,
            use: ExtractTextPlugin.extract({
                fallback: "style-loader",
                use: [
                    { loader: 'css-loader', options: {minimize: true, sourceMap: !!props.sourcemap}},
                    { loader: 'sass-loader', options: {sourceMap: !!props.sourcemap}}
                ]
            })
        } : {
            test: /\.scss/,
            loader: [
                { loader: 'style-loader', options: {sourceMap: !!props.sourcemap}},
                { loader: 'css-loader', options: {sourceMap: !!props.sourcemap}},
                { loader: 'sass-loader', options: {sourceMap: !!props.sourcemap}}
            ]
        },

        less: extractStyles ? {
            test: /\.less/,
            use: ExtractTextPlugin.extract({
                fallback: "style-loader",
                use: [
                    { loader: 'css-loader', options: {minimize: true, sourceMap: !!props.sourcemap}},
                    { loader: 'less-loader', options: {sourceMap: !!props.sourcemap}}
                ]
            })
        } : {
            test: /\.less/,
            loader: [
                { loader: 'style-loader', options: {sourceMap: !!props.sourcemap}},
                { loader: 'css-loader', options: {sourceMap: !!props.sourcemap}},
                { loader: 'less-loader', options: {sourceMap: !!props.sourcemap}}
            ]
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

function getPlugins(opts) {
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

    if (!isProduction) {
        Object.assign(modules, {
            HotModuleReplacementPlugin: () => new webpack.HotModuleReplacementPlugin()
        });
    }

    if (opts.analyzer) {
        Object.assign(modules, {
            RuntimeAnalyzer: () => new RuntimeAnalyzerPlugin()
        });
    }

    if (opts.copy) {
        Object.assign(modules, {
            CopyWebpackPlugin: () => {
                let prop = null;
                let opts = {};
                if (isObject(opts.copy)) {
                    if (opts.copy.from && opts.copy.to) {
                        prop = opts.copy;
                    }
                    else if (opts.copy.files) {
                        prop = opts.copy.files;
                        opts = opts.copy.opts || {};
                    }
                }
                else if (isArray(opts.copy)) {
                    prop = opts.copy;
                }
                if (!prop) {
                    return function() {};
                }
                return new CopyWebpackPlugin(prop, opts);
            }
        });
    }

    if (isProduction) {
        Object.assign(modules, {
            ModuleConcatenationPlugin: (props = {}) => new webpack.optimize.ModuleConcatenationPlugin(),
            ExtractTextPlugin: (props = {}) => {
                let addVersion = !!process.env.ROCKET_ADD_VERSION;
                let styleName = props.styles && props.styles.indexOf('.css') >= 0 ? props.styles : 'css/styles.css';
                styleName = styleName.split('.');

                if (styleName.length > 1 && addVersion && props.build_version) {
                    let last = styleName.length - 1;
                    let filename = last - 1;
                    styleName[filename] = styleName[filename] + '-' + props.build_version;
                }
                styleName = styleName.join('.');

                return new ExtractTextPlugin(styleName);
            },
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
                sourceMap: props.sourceMap || false,
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
            hot: true,
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

function makeModules(modules, props = {}, excludeModules = []) {
    return new Collection({
        data: excludeModules.reduce((modules, propsToDelete) => {
            delete modules[propsToDelete];
            return modules;
        }, modules),
        props
    });
}

function makePlugins(plugins, props = {}, excludePlugins = []) {
    return new Collection({
        data: excludePlugins.reduce((plugins, propsToDelete) => {
            delete plugins[propsToDelete];
            return plugins;
        }, plugins),
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