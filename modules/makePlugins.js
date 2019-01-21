const { existsSync } = require('fs');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const Collection = require('../utils/Collection');
const { isString, isBoolean, isArray, isObject, isNumber } = require('../utils/typeChecker');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const path = require('path');
const makeBanner = require('./makeBanner');
const ReloadHtmlWebpackPlugin = require('../utils/reloadHTML');
const FlowBabelWebpackPlugin = require('flow-babel-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const ImageminPlugin = require('imagemin-webpack-plugin').default;
const CleanWebpackPlugin = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const StatsWriterPlugin = require("webpack-stats-plugin").StatsWriterPlugin;
const WebpackBar = require('webpackbar');
const FlagDependencyUsagePlugin = require('webpack/lib/FlagDependencyUsagePlugin');
const FlagIncludedChunksPlugin = require('webpack/lib/optimize/FlagIncludedChunksPlugin');
const Dotenv = require('dotenv-webpack');
const WriteFilePlugin = require('write-file-webpack-plugin');
const NodemonPlugin = require('nodemon-webpack-plugin');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const imageminMozjpeg = require('imagemin-mozjpeg');

function getTitle(packageJson) {
    return `${packageJson.name.split('_').join(' ')}`;
}

const getPlugins = (conf, mode, root, packageJson, webpack, version) => {
    let plugins = {};

    /**
     * COMMON
     * */
    plugins.WebpackBar = new WebpackBar();

    if (existsSync(path.resolve(root, '.env'))) {
        plugins.Dotenv = new Dotenv({
            path: path.resolve(root, '.env')
        });
    }
    else if (isString(conf.dotenv)) {
        plugins.Dotenv = new Dotenv({
            path: conf.dotenv
        });
    }

    if (conf.write && mode !== 'production') {
        plugins.WriteFilePlugin = new WriteFilePlugin();
    }


    let banner = makeBanner(packageJson, root);

    if (conf.banner) {
        if (isString(conf.banner)) {
            banner = conf.banner;
        }
    } else {
        if (isBoolean(conf.banner) && conf.banner === false) {
            banner = false;
        }
    }

    conf.banner = banner;

    if (conf.banner) {
        plugins.BannerPlugin = new webpack.BannerPlugin({
            banner: !banner ? '' : banner,
            entryOnly: true
        });
    }

    if (conf.nodejs) {
        plugins.NodemonPlugin = isString(conf.nodemon) ? new NodemonPlugin({script: conf.nodemon}) : new NodemonPlugin();
    }

    let pages = [];
    let HTMLProcessing = true;

    if (typeof conf.html !== 'undefined' && isBoolean(conf.html) && conf.html === false) {
        HTMLProcessing = false;
    }
    if (HTMLProcessing) {
        if (conf.html && isArray(conf.html)) {
            pages = conf.html;
        }
        else {
            pages = [
                {
                    title: (conf.html && conf.html.title) || getTitle(packageJson),
                    code: (conf.html && conf.html.code) ? conf.html.code : null,
                    favicon: (conf.html && conf.html.favicon) ? conf.html.favicon : null,
                    template: (conf.html && conf.html.template) || path.resolve(__dirname, '..', './index.ejs')

                }
            ];
        }

        pages = pages.map(page => {
            if (version) {
                page.version = version;
            }
            if (!page.template) {
                page.template = path.resolve(__dirname, '..', './index.ejs');
            }
            if (!page.filename) {
                page.filename = page.template.slice(page.template.lastIndexOf('/') + 1, page.template.lastIndexOf('.'));
                page.filename += '.html';
            }
            return page;
        });

        pages.forEach((page, index) => {
            let q = `HtmlWebpackPlugin${index}`;

            plugins[q] = new HtmlWebpackPlugin(page);
        });

        if (mode === 'development') {
            if (!isNumber(conf.server.browserSyncPort)) {
                plugins.ReloadHtmlWebpackPlugin = new ReloadHtmlWebpackPlugin();
            }
        }
    }

    if (existsSync(path.resolve(root, 'eslintrc.js'))) {
        plugins.LoadOptions = new webpack.LoaderOptionsPlugin({
            test: /\.(js|jsx)$/,
            options: {
                eslint: {
                    configFile: path.resolve(root, 'eslintrc.js'),
                    eslintPath: require.resolve('eslint'),
                    formatter: require(require.resolve('eslint-formatter-pretty')),
                    ignore: false,
                    useEslintrc: false,
                    cache: false,
                }
            },
        });
    }

    let env = conf.global || {};
    let definePluginOpts = Object.assign(
        {},
        {
            'process.env.NODE_ENV': JSON.stringify(mode)
        },
        Object.keys(env).reduce((prev, curr) => {
            prev[`process.env.${curr}`] = JSON.stringify(env[curr]);
            return prev;
        }, {})
    );
    plugins.DefinePlugin = new webpack.DefinePlugin(definePluginOpts);

    if (existsSync(path.resolve(root, '.flowconfig'))) {
        plugins.FlowBabelWebpackPlugin = new FlowBabelWebpackPlugin();
    }

    if (conf.copy) {
        let _prop = null;
        let _opts = {};
        if (isObject(conf.copy)) {
            if (conf.copy.from && conf.copy.to) {
                _prop = [conf.copy];
            } else if (conf.copy.files) {
                _prop = conf.copy.files;
                _opts = conf.copy.opts || {};
            }
        } else if (isArray(conf.copy)) {
            _prop = conf.copy;
        }
        if (_prop) {
            plugins.CopyWebpackPlugin = new CopyWebpackPlugin(_prop, _opts);
        }
    }
    /**
     * DEVELOPMENT
     * */
    if (mode === 'development') {
        plugins.HotModuleReplacementPlugin = new webpack.HotModuleReplacementPlugin();

        plugins.NamedChunksPlugin = new webpack.NamedChunksPlugin();

        plugins.NamedModulesPlugin = new webpack.NamedModulesPlugin();
    }
    /**
     * PRODUCTION
     * */
    if (mode === 'production') {
        if (conf.stats) {
            plugins.StatsWriterPlugin = new StatsWriterPlugin({
                fields: null,
                stats: {chunkModules: true}
            });
        }

        let addVersion = !!version;
        let styleName = conf.styles && conf.styles.indexOf('.css') >= 0 ? conf.styles : 'css/styles.css';
        styleName = styleName.split('.');

        if (styleName.length > 1 && addVersion && version) {
            let last = styleName.length - 1;
            let filename = last - 1;
            styleName[filename] = styleName[filename] + '-' + version;
        }
        styleName = styleName.join('.');

        plugins.ModuleConcatenationPlugin = new webpack.optimize.ModuleConcatenationPlugin();

        plugins.MiniCssExtractPlugin = new MiniCssExtractPlugin({
            filename: styleName
        });
        plugins.ImageminPlugin = new ImageminPlugin({
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
            plugins: [
                imageminMozjpeg({
                    quality: 85,
                    progressive: true
                })
            ]
        });

        plugins.CleanWebpackPlugin = new CleanWebpackPlugin([conf.dist || './dist'], { root: root || __dirname });

        plugins.OccurrenceOrderPlugin = new webpack.optimize.OccurrenceOrderPlugin();

        plugins.FlagDependencyUsagePlugin = new FlagDependencyUsagePlugin();

        plugins.FlagIncludedChunksPlugin = new FlagIncludedChunksPlugin();

        plugins.NoEmitOnErrorsPlugin = new webpack.NoEmitOnErrorsPlugin();

        plugins.SideEffectsFlagPlugin = new webpack.optimize.SideEffectsFlagPlugin();

        plugins.UglifyJS = new UglifyJsPlugin({
            sourceMap: conf.debug,
            minify(file, sourceMap) {
                let terserOptions = {
                    mangle: true,
                    output: {
                        comments: new RegExp('banner')
                    },
                    compress: {
                        drop_console: !conf.debug,
                        drop_debugger: !conf.debug
                    }
                };

                if (sourceMap) {
                    terserOptions.sourceMap = {
                        content: sourceMap,
                    };
                }

                return require('terser').minify(file, terserOptions);
            }
        });

        plugins.OptimizeCssAssetsPlugin = new OptimizeCssAssetsPlugin({
            assetNameRegExp: /\.css$/g,
            cssProcessor: require('cssnano'),
            cssProcessorPluginOptions: {
                preset: ['default', { discardComments: { removeAll: true } }],
            },
            canPrint: true
        });
    }

    if (mode === 'development') {
        if (conf.nodejs) {
            plugins.CleanWebpackPlugin = new CleanWebpackPlugin([conf.dist || './dist'], { root: root || __dirname });
        }
    }

    return plugins;
};

const _makePlugins = (plugins) => {
    return new Collection({
        data: plugins,
        props: {}
    });
};

const makePlugins = (conf, root, packageJson, mode, webpack, version) => {
    let modules = getPlugins(conf, mode, root, packageJson, webpack, version);

    return _makePlugins(modules, conf);
};

module.exports = makePlugins;
