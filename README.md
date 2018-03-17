This is the simplest way to make webpack config with many default settings.
This config-generator include modules and features:

- webpack 3, webpack dev server
- babel 6, ES2015+
- React optimizations
- Flow
- Postcss: autoprefixer, mqpacker, lost, instagram filters, autoprefixer, rucksack
- Copy Webpack Plugin
- ESLint
- Templates: HTML/Jade/Handlebars,nunjucks
- CSS: css/sass/less + postcss
- Imagemin
- file import support: markdown, video, audio, fonts, svg, script, shaders etc
- svg + svgo
- parallel uglifyjs
- Hard Source Plugin (in production mode)

See to examples folder

```jsx
const { compile, customize } = require('rocket-starter');
```
### If you want build a library, you need to declarate this config.
When you start webpack it will be make only JS file, without styles and HTML and other media resources. JS will be build as UMD format.
```jsx
compile({library: 'MyLib'});
```
### Or:
```jsx
compile();
```
### If you want build a Application, you need to declarate this config.
When you start webpack it will be make HTML, media, JS etc
```jsx
compile({src: 'app.js' ... });
```
You can run it with NODE_ENV=production - it is active uglifier. If you want a styles extraction you need to set styles: 'mystyle.css'

### If you need to customize your config, you can use middlewares.

Middlewares divided to PRE and POST.

In PRE case, you catch all data before config will created
In POST case, you catch created config file.

Middlewares might be as object ({pre: []|fn, post:[]|fn}) or function.
If you send middleware as function it will be run as PRE middleware.
```jsx
compile(customize({
    src: 'source/index.js',
    dist: 'dist',
}, (...args) => {

}));
```
### Or:
```jsx
compile(customize({
    src: 'source/index.js',
    dist: 'dist',
    library: 'MyLib'
}, {
    pre: [fn, fn] || fn,
    post: [fn, fn] || fn
};
```

### Default properties:

```jsx
{
    dist: 'dist',
    src: 'src/index.js',
    url: '/',
    server: {
        port: 3000,
        host: 'localhost'
    }
}
```

### All properties

```jsx
{
    dist: 'dist',
    src: 'src/index.js',
    url: '/',
    server: {
        port: 3000,
        host: 'localhost'
    }
    // secondary properties
    cache: 'path to folder',
    library: 'test',
    styles: String,
    html: { // You can also add array for multi-pages support
        title: String,
        favicon: ...,
        version: Boolean,
        template: String, path to file
    }
    banner: String,
    global: {
        var: 'var1'
    },
    copy: {from: ... to: ...} || [] || {files: [], opts: {}}
}
```
"copy" is activate CopyWebpackPlugin and we can use default syntax but we can set files and opts. Opts is second parameter in this plugin.

You can use build version set "-v" flag. 

You can activate sourcemap in production version. You can call build script with "-d" flag.

If you don't need to extract styles to css file in production version you can set styles: false

<details>
  <summary>Config for DEVELOPMENT version</summary>
  <pre>
  {
      "cache": true,
      "entry": [
          "/index.js"
      ],
      "devtool": "source-map",
      "output": {
          "publicPath": "/",
          "path": "/dist",
          "filename": "[name].js"
      },
      "stats": {
          "hash": true,
          "version": true,
          "timings": true,
          "assets": true,
          "chunks": true,
          "modules": true,
          "reasons": true,
          "children": true,
          "source": false,
          "errors": true,
          "errorDetails": true,
          "warnings": true,
          "publicPath": true
      },
      "node": {
          "fs": "empty"
      },
      "resolve": {
          "extensions": [
              ".js",
              ".jsx"
          ]
      },
      "devServer": {
          "headers": {
              "Access-Control-Allow-Origin": "*",
              "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
              "Access-Control-Allow-Headers": "X-Requested-With, content-type, Authorization"
          },
          "port": 3000,
          "noInfo": true,
          "quiet": false,
          "lazy": false,
          "hot": false,
          "inline": true,
          "stats": "minimal",
          "overlay": {
              "errors": true
          },
          "watchOptions": {
              "aggregateTimeout": 50,
              "ignored": {}
          },
          "historyApiFallback": true,
          "host": "localhost"
      },
      "module": {
          "rules": [
              {
                  "test": /\.html$/,
                  "use": "file-loader?name=[name].[ext]"
              },
              {
                  "test": /\.css$/,
                  "loader": [
                      "style-loader",
                      "css-loader",
                      { loader: require.resolve('postcss-loader'), options: { config: getPostcssConfig(), sourceMap: !!argv.d } }
                  ]
              },
              {
                  "test": /\.scss/,
                  "loader": [
                      "style-loader",
                      "css-loader",
                      { loader: require.resolve('postcss-loader'), options: { config: getPostcssConfig(), sourceMap: !!argv.d } },
                      "sass-loader"
                  ]
              },
              {
                  "test": /\.less/,
                  "loader": [
                      "style-loader",
                      "css-loader",
                      { loader: require.resolve('postcss-loader'), options: { config: getPostcssConfig(), sourceMap: !!argv.d } },
                      "less-loader"
                  ]
              },
              {
                test: /\.(glsl|vs|fs)$/,
                use: [
                    {
                        loader: 'shader-loader'
                    }
                ]
              },
              {
                test: /\.(njk|nunjucks)$/,
                loader: 'nunjucks-isomorphic-loader',
                query: {
                    root: [root]
                }
              },
              {
                  test: /\.(hbs|handlebars)$/,
                  use: [
                      {
                          loader: 'handlebars-loader'
                      }
                  ]
              },
              {
                  test: /\.(pug|jade)$/,
                  use: [
                      {
                          loader: 'pug-loader'
                      }
                  ]
              },
              {
                  enforce: 'pre',
                  test: /\.(js|jsx)$/,
                  exclude: /node_modules/,
                  use: [
                      {
                          loader: 'eslint-loader'
                      }
                  ]
              },
              {
                  test: /\.(mp4|webm|ogg|mp3)$/,
                  use: [
                      {
                          loader: require.resolve('file-loader')
                      }
                  ]
              },
              {
                  "test": /\.(js|jsx)$/,
                  "exclude": /node_modules/,
                  "use": [
                      {
                          "loader": "babel-loader",
                          "query": {
                              "cacheDirectory": true,
                              "babelrc": false,
                              "presets": [
                                  [
                                      require.resolve('babel-preset-es2015'), {
                                          modules: false
                                      }
                                  ],
                                  require.resolve('babel-preset-stage-0'),
                                  require.resolve('babel-preset-react')
                              ],
                              "plugins": [
                                  require.resolve('babel-plugin-transform-flow-comments'),
                                  require.resolve('babel-plugin-transform-decorators-legacy')
                              ],
                              "env": {
                                  "production": {
                                      "plugins": [
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
              {
                  "test": /\.(jpe?g|png|gif)$/i,
                  "loaders": [
                      "url-loader?limit=10000&name=images/[name].[ext]"
                  ]
              },
              {
                  test: /\.(eot|svg|ttf|woff|woff2)$/,
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
              {
                  "test": /\.md$/,
                  "loader": "html-loader!markdown-loader"
              },
              {
                  "test": /\.json/,
                  "loader": "json-loader"
              },
              {
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
          ]
      },
      "plugins": [
          new webpack.optimize.OccurrenceOrderPlugin(),
          new HtmlWebpackPlugin(props.html),
          new FlowBabelWebpackPlugin(),
          new ReloadHtmlWebpackPlugin(),
          new webpack.DefinePlugin(Object.assign({
              'process.env': {
                  NODE_ENV: JSON.stringify(process.env.NODE_ENV)
              }
          }, props.global),
          new OpenBrowserPlugin({ url: `http://${props.server.host}:${props.server.port}` }))
      ],
      "externals": []
  }
  </pre>
</details>

<details>
  <summary>Config for PRODUCTION version</summary>
  <pre>
  {
      "cache": true,
      "entry": [
          "/index.js"
      ],
      "devtool": "source-map",
      "output": {
          "publicPath": "/",
          "path": "/dist",
          "filename": "[name].js"
      },
      "stats": {
          "hash": true,
          "version": true,
          "timings": true,
          "assets": true,
          "chunks": true,
          "modules": true,
          "reasons": true,
          "children": true,
          "source": false,
          "errors": true,
          "errorDetails": true,
          "warnings": true,
          "publicPath": true
      },
      "node": {
          "fs": "empty"
      },
      "resolve": {
          "extensions": [
              ".js",
              ".jsx"
          ]
      },
      "devServer": {
          "headers": {
              "Access-Control-Allow-Origin": "*",
              "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
              "Access-Control-Allow-Headers": "X-Requested-With, content-type, Authorization"
          },
          "port": 3000,
          "noInfo": true,
          "quiet": false,
          "lazy": false,
          "hot": false,
          "inline": true,
          "stats": "minimal",
          "overlay": {
              "errors": true
          },
          "watchOptions": {
              "aggregateTimeout": 50,
              "ignored": {}
          },
          "historyApiFallback": true,
          "host": "localhost"
      },
      "module": {
          "rules": [
                {
                    "test": /\.html$/,
                    "use": "file-loader?name=[name].[ext]"
                },
                {
                    "test": /\.css$/,
                    "loader": [
                        "style-loader",
                        "css-loader",
                        { loader: require.resolve('postcss-loader'), options: { config: getPostcssConfig(), sourceMap: !!argv.d } }
                    ]
                },
                {
                    "test": /\.scss/,
                    "loader": [
                        "style-loader",
                        "css-loader",
                        { loader: require.resolve('postcss-loader'), options: { config: getPostcssConfig(), sourceMap: !!argv.d } },
                        "sass-loader"
                    ]
                },
                {
                    "test": /\.less/,
                    "loader": [
                        "style-loader",
                        "css-loader",
                        { loader: require.resolve('postcss-loader'), options: { config: getPostcssConfig(), sourceMap: !!argv.d } },
                        "less-loader"
                    ]
                },
                {
                  test: /\.(glsl|vs|fs)$/,
                  use: [
                      {
                          loader: 'shader-loader'
                      }
                  ]
                },
                {
                  test: /\.(njk|nunjucks)$/,
                  loader: 'nunjucks-isomorphic-loader',
                  query: {
                      root: [root]
                  }
                },
                {
                    test: /\.(hbs|handlebars)$/,
                    use: [
                        {
                            loader: 'handlebars-loader'
                        }
                    ]
                },
                {
                    test: /\.(pug|jade)$/,
                    use: [
                        {
                            loader: 'pug-loader'
                        }
                    ]
                },
                {
                    enforce: 'pre',
                    test: /\.(js|jsx)$/,
                    exclude: /node_modules/,
                    use: [
                        {
                            loader: 'eslint-loader'
                        }
                    ]
                },
                {
                    test: /\.(mp4|webm|ogg|mp3)$/,
                    use: [
                        {
                            loader: require.resolve('file-loader')
                        }
                    ]
                },
                {
                    "test": /\.(js|jsx)$/,
                    "exclude": /node_modules/,
                    "use": [
                        {
                            "loader": "babel-loader",
                            "query": {
                                "cacheDirectory": true,
                                "babelrc": false,
                                "presets": [
                                    [
                                        require.resolve('babel-preset-es2015'), {
                                            modules: false
                                        }
                                    ],
                                    require.resolve('babel-preset-stage-0'),
                                    require.resolve('babel-preset-react')
                                ],
                                "plugins": [
                                    require.resolve('babel-plugin-transform-flow-comments'),
                                    require.resolve('babel-plugin-transform-decorators-legacy')
                                ],
                                "env": {
                                    "production": {
                                        "plugins": [
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
                {
                    "test": /\.(jpe?g|png|gif)$/i,
                    "loaders": [
                        "url-loader?limit=10000&name=images/[name].[ext]"
                    ]
                },
                {
                    test: /\.(eot|svg|ttf|woff|woff2)$/,
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
                {
                    "test": /\.md$/,
                    "loader": "html-loader!markdown-loader"
                },
                {
                    "test": /\.json/,
                    "loader": "json-loader"
                },
                {
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
          ]
      },
      "plugins": [
          new webpack.optimize.OccurrenceOrderPlugin(),
          new HtmlWebpackPlugin(props.html),
          new FlowBabelWebpackPlugin(),
          new webpack.DefinePlugin(Object.assign({
              'process.env': {
                  NODE_ENV: JSON.stringify(process.env.NODE_ENV)
              }
          }, props.global),
          new webpack.optimize.ModuleConcatenationPlugin(),
          new ExtractTextPlugin(props.path || 'css/styles.css'),
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
              svgo: {
              },
              pngquant: null,
              plugins: []
          }),
          new CleanWebpackPlugin(props),
          new HardSourceWebpackPlugin(),
          new ParallelUglifyJSPlugin({
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
          new webpack.BannerPlugin(banner)
      ],
      "externals": []
  }
  </pre>
</details>

We can add eslint config. Just add eslintrc.js in your main (project) dir.

We can add postcss config. Just add postcss.config.js  in your main (project) dir.

Add .flowconfig to root folder and that activation flow-type checking