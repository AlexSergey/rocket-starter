const { existsSync, readFileSync } = require('fs');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');
const ImageminPlugin = require('imagemin-webpack-plugin').default;
const CleanWebpackPlugin = require('clean-webpack-plugin');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const moment = require('moment');
const { argv } = require('yargs');
const { isArray, isObject } = require('./typeChecker');
const Collection = require('./Collection');

function getBuildVersion() {
    if (typeof argv.v === 'boolean') {
        return moment().format('DDMM-hhmm');
    }
    return false;
}

function getArgs() {
    return argv;
}

function getWebpack() {
    return webpack;
}

function getTitle(packageJson) {
    return `${packageJson.name} ${packageJson.version}`;
}

function makeBanner(packageJson) {
    let banner = existsSync(path.resolve(__dirname, '..', './banner')) ? readFileSync(path.resolve(__dirname, '..', './banner'), 'utf8') : '';

    if (!!banner) {
        let types = ['name', 'version', 'author', 'email', 'description', 'license'];

        types.forEach(type => {
            if (banner.indexOf(type) > 0 && !!packageJson[type]) {
                banner = banner.replace(`$\{${type}\}`, packageJson[type]);
            }
        });
        types.forEach(type => (banner = banner.replace(`$\{${type}\}`, '')));

        banner = banner
            .split('\n')
            .filter(item => item !== '\r' && item !== '\n')
            .join('\n');

        return banner;
    } else {
        return false;
    }
}

function getEntry(entry = './source/index.js') {
    const root = path.dirname(require.main.filename);

    return {
        entry: isArray(entry) ? entry.map(p => path.resolve(root, p)) : [path.resolve(root, entry)]
    };
}

function getDevtool(customSourceMap = 'none') {
    let sourceMap = !!argv.d ? 'source-map' : false;

    sourceMap = customSourceMap === 'none' ? sourceMap : customSourceMap;
    return {
        devtool: sourceMap
    };
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
    let extractStyles = props.extractStyles && process.env.NODE_ENV === 'production';

    return {
        html: {
            test: /\.html$/,
            use: [
                {
                    loader: require.resolve('file-loader'),
                    query: {
                        name: '[name].[ext]'
                    }
                }
            ]
        },

        css: extractStyles
            ? {
                  test: /\.css$/,
                  use: ExtractTextPlugin.extract({
                      fallback: require.resolve('style-loader'),
                      use: { loader: require.resolve('css-loader'), options: { minimize: true, sourceMap: !!argv.d } }
                  })
              }
            : {
                  test: /\.css$/,
                  loader: [
                      { loader: require.resolve('style-loader'), options: { sourceMap: !!argv.d } },
                      { loader: require.resolve('css-loader'), options: { sourceMap: !!argv.d } }
                  ]
              },

        scss: extractStyles
            ? {
                  test: /\.scss/,
                  use: ExtractTextPlugin.extract({
                      fallback: require.resolve('style-loader'),
                      use: [
                          { loader: require.resolve('css-loader'), options: { minimize: true, sourceMap: !!argv.d } },
                          { loader: require.resolve('sass-loader'), options: { sourceMap: !!argv.d } }
                      ]
                  })
              }
            : {
                  test: /\.scss/,
                  loader: [
                      { loader: require.resolve('style-loader'), options: { sourceMap: !!argv.d } },
                      { loader: require.resolve('css-loader'), options: { sourceMap: !!argv.d } },
                      { loader: require.resolve('sass-loader'), options: { sourceMap: !!argv.d } }
                  ]
              },

        less: extractStyles
            ? {
                  test: /\.less/,
                  use: ExtractTextPlugin.extract({
                      fallback: require.resolve('style-loader'),
                      use: [
                          { loader: require.resolve('css-loader'), options: { minimize: true, sourceMap: !!argv.d } },
                          { loader: require.resolve('less-loader'), options: { sourceMap: !!argv.d } }
                      ]
                  })
              }
            : {
                  test: /\.less/,
                  loader: [
                      { loader: require.resolve('style-loader'), options: { sourceMap: !!argv.d } },
                      { loader: require.resolve('css-loader'), options: { sourceMap: !!argv.d } },
                      { loader: require.resolve('less-loader'), options: { sourceMap: !!argv.d } }
                  ]
              },

        js: {
            test: /\.(js|jsx)$/,
            exclude: /node_modules/,
            use: [
                {
                    loader: require.resolve('babel-loader'),
                    query: {
                        cacheDirectory: true,
                        babelrc: false,
                        presets: [
                            [
                                require.resolve('babel-preset-es2015'),
                                {
                                    modules: false
                                }
                            ],
                            require.resolve('babel-preset-stage-0'),
                            require.resolve('babel-preset-react')
                        ],
                        plugins: [require.resolve('babel-plugin-transform-decorators-legacy')],
                        env: {
                            production: {
                                plugins: [
                                    require.resolve('babel-plugin-transform-es2015-modules-commonjs'),
                                    require.resolve('babel-plugin-transform-react-constant-elements'),
                                    require.resolve('babel-plugin-transform-react-inline-elements'),
                                    require.resolve('babel-plugin-transform-react-pure-class-to-function'),
                                    require.resolve('babel-plugin-transform-react-remove-prop-types')
                                ]
                            }
                        }
                    }
                }
            ]
        },

        video: {
            test: /\.mp4$/,
            loader: 'file'
        },

        images: {
            test: /\.(jpe?g|png|gif)$/i,
            use: [
                {
                    loader: require.resolve('url-loader'),
                    query: {
                        limit: 10000,
                        name: 'images/[name].[ext]'
                    }
                }
            ]
        },

        fonts: {
            test: /\.(eot|svg|ttf|woff|woff2)$/,
            use: [
                {
                    loader: require.resolve('url-loader'),
                    query: {
                        limit: 10000,
                        name: 'fonts/[name].[ext]'
                    }
                }
            ]
        },

        markdown: {
            test: /\.md$/,
            use: [
                {
                    loader: require.resolve('html-loader')
                },
                {
                    loader: require.resolve('markdown-loader')
                }
            ]
        },

        json: {
            test: /\.json/,
            loader: require.resolve('json-loader')
        },

        svg: {
            test: /\.svg$/,
            use: [
                {
                    loader: require.resolve('svg-inline-loader')
                },
                {
                    loader: require.resolve('svgo-loader'),
                    options: {
                        plugins: [{ removeTitle: true }, { convertColors: { shorthex: false } }, { convertPathData: false }]
                    }
                }
            ]
        }
    };
}

function getPlugins(opts) {
    let isProduction = process.env.NODE_ENV === 'production';
    let debugMode = !!argv.d;
    let console = !argv.console;

    let modules = {
        OccurrenceOrderPlugin: () => new webpack.optimize.OccurrenceOrderPlugin(),
        HtmlWebpackPlugin: (
            props = {
                title: 'app',
                version: 1,
                template: path.resolve(__dirname, '..', './index.ejs')
            }
        ) => new HtmlWebpackPlugin(props),
        DefinePlugin: (env = {}) => {
            let opts = Object.assign(
                {},
                {
                    NODE_ENV: JSON.stringify(process.env.NODE_ENV)
                },
                Object.keys(env).reduce((prev, curr) => {
                    prev[curr] = JSON.stringify(env[curr]);
                    return prev;
                }, {})
            );
            return new webpack.DefinePlugin({
                'process.env': opts
            });
        }
    };

    if (!isProduction) {
        Object.assign(modules, {
            HotModuleReplacementPlugin: () => new webpack.HotModuleReplacementPlugin()
        });
    }

    if (opts.copy) {
        Object.assign(modules, {
            CopyWebpackPlugin: () => {
                let _prop = null;
                let _opts = {};
                if (isObject(opts.copy)) {
                    if (opts.copy.from && opts.copy.to) {
                        _prop = [opts.copy];
                    } else if (opts.copy.files) {
                        _prop = opts.copy.files;
                        _opts = opts.copy.opts || {};
                    }
                } else if (isArray(opts.copy)) {
                    _prop = opts.copy;
                }
                if (!_prop) {
                    return function() {};
                }
                return new CopyWebpackPlugin(_prop, _opts);
            }
        });
    }

    if (isProduction) {
        Object.assign(modules, {
            ModuleConcatenationPlugin: (props = {}) => new webpack.optimize.ModuleConcatenationPlugin(),
            ExtractTextPlugin: (props = {}) => {
                let addVersion = !!argv.v;
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
            ImageminPlugin: (props = {}) =>
                new ImageminPlugin({
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
                    svgo: {},
                    pngquant: null,
                    plugins: []
                }),
            CleanWebpackPlugin: (props = {}) => new CleanWebpackPlugin([props.path || './dist'], { root: props.root || __dirname }),

            UglifyJSPlugin: (props = {}) =>
                new UglifyJSPlugin({
                    sourceMap: debugMode,
                    uglifyOptions: {
                        ie8: false,
                        ecma: 5,
                        output: {
                            comments: false,
                            beautify: false
                        },
                        warnings: false,
                        compress: {
                            drop_console: console
                        }
                    }
                }),

            BannerPlugin: ({ banner }) => new webpack.BannerPlugin(!banner ? '' : banner)
        });
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
    };
}

function getDevServer(props = {}) {
    return {
        devServer: {
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
                'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization'
            },
            port: props.port || 3000,
            noInfo: true,
            quiet: false,
            lazy: false,
            hot: true,
            inline: true,
            stats: 'minimal',
            overlay: {
                errors: true
            },
            watchOptions: {
                poll: true,
                aggregateTimeout: 50,
                ignored: /node_modules/
            },
            historyApiFallback: true,
            host: props.host || 'localhost'
        }
    };
}

function getResolve() {
    return {
        resolve: {
            extensions: ['.js', '.jsx']
        }
    };
}

function getNode(modules = {}) {
    return {
        node: Object.assign(
            {
                fs: 'empty'
            },
            modules
        )
    };
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
    makePlugins,
    getArgs
};
