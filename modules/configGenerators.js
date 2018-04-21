const { existsSync, readFileSync } = require('fs');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ReloadHtmlWebpackPlugin = require('./reloadHTML');
const path = require('path');
const ImageminPlugin = require('imagemin-webpack-plugin').default;
const CleanWebpackPlugin = require('clean-webpack-plugin');
const ParallelUglifyPlugin = require('webpack-parallel-uglify-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const moment = require('moment');
const { argv } = require('yargs');
const { isArray, isObject } = require('./typeChecker');
const Collection = require('./Collection');
const FlowBabelWebpackPlugin = require('flow-babel-webpack-plugin');
const HardSourceWebpackPlugin = require('hard-source-webpack-plugin');
const WebpackBar = require('webpackbar');

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
    return `${packageJson.name.split('_').join(' ')}`;
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
            publicPath: props.url,
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
    const root = path.dirname(require.main.filename);

    const getPostcssConfig = () => {
        const pth = existsSync(path.resolve(root, './postcss.config.js')) ? path.resolve(root, './postcss.config.js') : path.resolve(__dirname, './postcss.config.js');

        return {
            path: pth
        }
    };

    return {
        handlebars: {
            test: /\.(hbs|handlebars)$/,
            use: [
                {
                    loader: require.resolve('handlebars-loader')
                }
            ]
        },

        jade: {
            test: /\.(pug|jade)$/,
            use: [
                {
                    loader: require.resolve('pug-loader')
                }
            ]
        },

        nunjucks: {
            test: /\.(njk|nunjucks)$/,
            loader: require.resolve('nunjucks-isomorphic-loader'),
            query: {
                root: [root]
            }
        },

        shaders: {
            test: /\.(glsl|vs|fs)$/,
            use: [
                {
                    loader: require.resolve('shader-loader')
                }
            ]
        },

        css: extractStyles
            ? {
                  test: /\.css$/,
                  use: ExtractTextPlugin.extract({
                      fallback: require.resolve('style-loader'),
                      use: [
                          { loader: require.resolve('css-loader'), options: { minimize: true, sourceMap: !!argv.d } },
                          { loader: require.resolve('postcss-loader'), options: { config: getPostcssConfig(), sourceMap: !!argv.d } }
                      ]
                  })
              }
            : {
                  test: /\.css$/,
                  loader: [
                      { loader: require.resolve('style-loader'), options: { sourceMap: !!argv.d } },
                      { loader: require.resolve('css-loader'), options: { sourceMap: !!argv.d } },
                      { loader: require.resolve('postcss-loader'), options: { config: getPostcssConfig(), sourceMap: !!argv.d } }
                  ]
              },

        scss: extractStyles
            ? {
                  test: /\.scss/,
                  use: ExtractTextPlugin.extract({
                      fallback: require.resolve('style-loader'),
                      use: [
                          { loader: require.resolve('css-loader'), options: { minimize: true, sourceMap: !!argv.d } },
                          { loader: require.resolve('postcss-loader'), options: { config: getPostcssConfig(), sourceMap: !!argv.d } },
                          { loader: require.resolve('sass-loader'), options: { sourceMap: !!argv.d } }
                      ]
                  })
              }
            : {
                  test: /\.scss/,
                  loader: [
                      { loader: require.resolve('style-loader'), options: { sourceMap: !!argv.d } },
                      { loader: require.resolve('css-loader'), options: { sourceMap: !!argv.d } },
                      { loader: require.resolve('postcss-loader'), options: { config: getPostcssConfig(), sourceMap: !!argv.d } },
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
                          { loader: require.resolve('postcss-loader'), options: { config: getPostcssConfig(), sourceMap: !!argv.d } },
                          { loader: require.resolve('less-loader'), options: { sourceMap: !!argv.d } }
                      ]
                  })
              }
            : {
                  test: /\.less/,
                  loader: [
                      { loader: require.resolve('style-loader'), options: { sourceMap: !!argv.d } },
                      { loader: require.resolve('css-loader'), options: { sourceMap: !!argv.d } },
                      { loader: require.resolve('postcss-loader'), options: { config: getPostcssConfig(), sourceMap: !!argv.d } },
                      { loader: require.resolve('less-loader'), options: { sourceMap: !!argv.d } }
                  ]
              },

        jsPre: {
            enforce: 'pre',
            test: /\.(js|jsx)$/,
            exclude: /node_modules/,
            use: [
                {
                    loader: require.resolve('eslint-loader')
                }
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
                        plugins: [
                            require.resolve('babel-plugin-transform-flow-comments'),
                            require.resolve('babel-plugin-transform-decorators-legacy')
                        ],
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
            test: /\.(mp4|webm|ogg|mp3)$/,
            use: [
                {
                    loader: require.resolve('file-loader')
                }
            ]
        },

        images: {
            test: /\.(jpe?g|png|gif)$/i,
            use: [
                {
                    loader: require.resolve('url-loader'),
                    query: {
                        limit: 10000,
                        name: 'images/[name][hash].[ext]'
                    }
                }
            ]
        },

        fonts: {
            test: /\.(eot|ttf|woff|woff2)$/,
            use: [
                {
                    loader: require.resolve('url-loader'),
                    query: {
                        limit: 10000,
                        name: 'fonts/[name][hash].[ext]'
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
    let isDevelopment = process.env.NODE_ENV === 'development';
    let debugMode = !!argv.d;
    let _console = !argv.console;
    const root = path.dirname(require.main.filename);

    let modules = {
        LoadOptions: () => new webpack.LoaderOptionsPlugin({
            test: /\.(js|jsx)$/,
            options: {
                eslint: {
                    configFile: existsSync(path.resolve(root, 'eslintrc.js')) ? path.resolve(root, 'eslintrc.js') : path.resolve(__dirname, 'eslintrc.js'),
                    eslintPath: require.resolve('eslint'),
                    formatter: require(require.resolve('eslint-formatter-pretty')),
                    ignore: false,
                    useEslintrc: false,
                    cache: false,
                }
            },
        }),
        WebpackBar: () => new WebpackBar(),
        OccurrenceOrderPlugin: () => new webpack.optimize.OccurrenceOrderPlugin(),
        HtmlWebpackPlugin: props => props.pages.map(page => new HtmlWebpackPlugin(page)),
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

    if (isDevelopment) {
        modules.ReloadHtmlWebpackPlugin = () => new ReloadHtmlWebpackPlugin();
    }

    if (existsSync(path.resolve(root, '.flowconfig'))) {
        modules.FlowBabelWebpackPlugin = () => new FlowBabelWebpackPlugin();
    }

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
            HardSourceWebpackPlugin: () => new HardSourceWebpackPlugin(opts.cache ? {
                cacheDirectory: `${path.join(opts.cache, 'hard-source')}/[confighash]`
            } : {}),
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

            ParallelUglifyPlugin: (props = {}) =>
                new ParallelUglifyPlugin({
                    cacheDir: opts.cache ? path.join(opts.cache, 'parallel-uglify') : path.join(root, 'node_modules', '.cache', 'parallel-uglify'),
                    sourceMap: debugMode,
                    uglifyJS: {
                        ie8: false,
                        output: {
                            comments: false,
                            beautify: false
                        },
                        warnings: false,
                        compress: {
                            drop_console: _console
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
