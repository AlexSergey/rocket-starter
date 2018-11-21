const { existsSync } = require('fs');
const Collection = require('../utils/Collection');
const path = require('path');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

const getPostcssConfig = (root) => {
    const pth = existsSync(path.resolve(root, './postcss.config.js')) ? path.resolve(root, './postcss.config.js') : path.resolve(__dirname, '../configs/postcss.config.js');

    return {
        path: pth
    }
};

function getModules(conf = {}, mode, root) {
    let extractStyles = conf.styles && mode === 'production';

    let debug = false;

    if (mode === 'development') {
        debug = true;
    }
    if (conf.debug) {
        debug = true;
    }

    let finalConf = {
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
            use: [
                {
                    loader: require.resolve('nunjucks-isomorphic-loader'),
                    query: {
                        root: [root]
                    }
                }
            ]
        },

        shaders: {
            test: /\.(glsl|vs|fs)$/,
            use: [
                {
                    loader: require.resolve('shader-loader')
                }
            ]
        },

        css: {
            test: /\.css$/,
            use: [
                extractStyles ? MiniCssExtractPlugin.loader : { loader: require.resolve('style-loader'), options: { sourceMap: debug } },
                { loader: require.resolve('css-loader'), options: { minimize: true, sourceMap: debug } },
                { loader: require.resolve('postcss-loader'), options: { config: getPostcssConfig(root), sourceMap: debug } }
            ]
        },

        scss: {
            test: /\.scss/,
            use: [
                extractStyles ? MiniCssExtractPlugin.loader : { loader: require.resolve('style-loader'), options: { sourceMap: debug } },
                { loader: require.resolve('css-loader'), options: { minimize: true, sourceMap: debug } },
                { loader: require.resolve('postcss-loader'), options: { config: getPostcssConfig(root), sourceMap: debug } },
                { loader: require.resolve('sass-loader'), options: { sourceMap: debug } }
            ]
        },

        less: {
            test: /\.less/,
            use: [
                extractStyles ? MiniCssExtractPlugin.loader : { loader: require.resolve('style-loader'), options: { sourceMap: debug } },
                { loader: require.resolve('css-loader'), options: { minimize: true, sourceMap: debug } },
                { loader: require.resolve('postcss-loader'), options: { config: getPostcssConfig(root), sourceMap: debug } },
                { loader: require.resolve('less-loader'), options: { sourceMap: debug } }
            ]
        },

        js: {
            test: /\.(js|jsx)$/,
            exclude: /(node_modules|bower_components)/,
            use: [
                {
                    loader: require.resolve('babel-loader'),
                    query: {
                        cacheDirectory: true,
                        babelrc: false,
                        presets: [
                            [require.resolve('@babel/preset-env'), {
                                targets: {
                                    browsers: [
                                        "> 5%"
                                    ]
                                },
                                useBuiltIns: 'entry',
                                modules: false,
                                loose: true,
                            }],
                            require.resolve('@babel/preset-react')
                        ],
                        plugins: [
                            require.resolve('@babel/plugin-syntax-dynamic-import'),
                            require.resolve('@babel/plugin-transform-flow-comments'),
                            [require.resolve('@babel/plugin-proposal-decorators'), { "legacy": true }],
                            require.resolve('@babel/plugin-proposal-class-properties'),
                            require.resolve('@babel/plugin-proposal-object-rest-spread')
                        ],
                        env: {
                            production: {
                                plugins: [
                                    require.resolve('@babel/plugin-transform-react-constant-elements'),
                                    require.resolve('@babel/plugin-transform-react-inline-elements'),
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

    if (existsSync(path.resolve(root, 'eslintrc.js'))) {
        finalConf.jsPre = {
            enforce: 'pre',
            test: /\.(js|jsx)$/,
            exclude: /node_modules/,
            use: [{
                loader: require.resolve('eslint-loader')
            }]
        }
    }

    return finalConf;
}

const _makeModules = (modules, conf = {}, excludeModules = []) => {
    excludeModules.forEach(propsToDelete => {
        delete modules[propsToDelete];
    });
    return new Collection({
        data: modules,
        props: {}
    });
};

const makeModules = (conf, root, packageJson, mode, excludeModules) => {
    let modules = getModules(conf, mode, root);

    return _makeModules(modules, conf);
};

module.exports = makeModules;
