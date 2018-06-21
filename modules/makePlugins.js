const { existsSync } = require('fs');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const Collection = require('../utils/Collection');
const { isString, isBoolean, isArray, isObject } = require('../utils/typeChecker');
const path = require('path');
const makeBanner = require('./makeBanner');
const ReloadHtmlWebpackPlugin = require('../utils/reloadHTML');
const FlowBabelWebpackPlugin = require('flow-babel-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const ImageminPlugin = require('imagemin-webpack-plugin').default;
const CleanWebpackPlugin = require('clean-webpack-plugin');
const HardSourceWebpackPlugin = require('hard-source-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const StatsWriterPlugin = require("webpack-stats-plugin").StatsWriterPlugin;
const LodashModuleReplacementPlugin = require('lodash-webpack-plugin');

function getTitle(packageJson) {
    return `${packageJson.name.split('_').join(' ')}`;
}

const getPlugins = (conf, mode, root, packageJson, webpack, version) => {
    let plugins = {};

    if (mode === 'production') {
        plugins.StatsWriterPlugin = new StatsWriterPlugin({
            fields: null,
            stats: {chunkModules: true}
        })
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
        plugins.BannerPlugin = new webpack.BannerPlugin(!banner ? '' : banner)
    }

    if (!conf.library) {
        let pages = [];

        if (conf.html && isArray(conf.html)) {
            pages = conf.html;
        }
        else {
            pages = [
                {
                    title: (conf.html && conf.html.title) || getTitle(packageJson),
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
            plugins.ReloadHtmlWebpackPlugin = new ReloadHtmlWebpackPlugin();
        }
    }

    plugins.LoadOptions = new webpack.LoaderOptionsPlugin({
        test: /\.(js|jsx)$/,
        options: {
            eslint: {
                configFile: existsSync(path.resolve(root, 'eslintrc.js')) ? path.resolve(root, 'eslintrc.js') : path.resolve(__dirname, '../configs', 'eslintrc.js'),
                eslintPath: require.resolve('eslint'),
                formatter: require(require.resolve('eslint-formatter-pretty')),
                ignore: false,
                useEslintrc: false,
                cache: false,
            }
        },
    });

    let env = conf.global || {};
    let definePluginOpts = Object.assign(
        {},
        {
            NODE_ENV: JSON.stringify(mode)
        },
        Object.keys(env).reduce((prev, curr) => {
            prev[curr] = JSON.stringify(env[curr]);
            return prev;
        }, {})
    );

    plugins.DefinePlugin = new webpack.DefinePlugin({
        'process.env': definePluginOpts
    });

    if (existsSync(path.resolve(root, '.flowconfig'))) {
        plugins.FlowBabelWebpackPlugin = new FlowBabelWebpackPlugin();
    }

    if (conf.copy) {
        let _prop = null;
        let _opts = {};
        if (isObject(conf.copy)) {
            if (conf.copy.from && conf.copy.to) {
                _prop = [opts.copy];
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

    if (mode === 'production') {
        let addVersion = !!version;
        let styleName = conf.styles && conf.styles.indexOf('.css') >= 0 ? conf.styles : 'css/styles.css';
        styleName = styleName.split('.');

        if (styleName.length > 1 && addVersion && version) {
            let last = styleName.length - 1;
            let filename = last - 1;
            styleName[filename] = styleName[filename] + '-' + version;
        }
        styleName = styleName.join('.');

        plugins.HardSourceWebpackPlugin = new HardSourceWebpackPlugin(conf.cache ? {
            cacheDirectory: `${path.join(conf.cache, 'hard-source')}/[confighash]`
        } : {});

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
            plugins: []
        });

        plugins.CleanWebpackPlugin = new CleanWebpackPlugin([conf.dist || './dist'], { root: root || __dirname });

        plugins.OccurrenceOrderPlugin = new webpack.optimize.OccurrenceOrderPlugin();

        plugins.BannerPlugin = new webpack.BannerPlugin({
            banner: !banner ? '' : banner,
            entryOnly: true
        });

        plugins.LodashModuleReplacementPlugin = new LodashModuleReplacementPlugin();
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
