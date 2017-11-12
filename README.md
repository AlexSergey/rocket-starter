# This is experimental!

This is the simplest way to make webpack config with many default settings.

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
    server: {
        port: 3000,
        host: 'localhost'
    }
    // secondary properties
    sourcemap: 'source-map',
    library: 'test',
    styles: String,
    html: {
        title: String,
        version: Boolean,
        template: String, path to file
    }
    banner: String,
    global: {
        var: 'var1'
    }
}
```

You can use build version set in process.env.ROCKET_BUILD_VERSION

You can activate sourcemap in production version. You could set sourcemap: 'source-map' in your config.

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
                      "css-loader"
                  ]
              },
              {
                  "test": /\.scss/,
                  "loader": [
                      "style-loader",
                      "css-loader",
                      "sass-loader"
                  ]
              },
              {
                  "test": /\.less/,
                  "loader": [
                      "style-loader",
                      "css-loader",
                      "less-loader"
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
                                  require.resolve('babel-plugin-transform-decorators-legacy')
                              ],
                              "env": {
                                  "production": {
                                      "plugins": [
                                          require.resolve('babel-plugin-transform-react-constant-elements'),
                                          require.resolve('babel-plugin-transform-react-inline-elements'),
                                          require.resolve('babel-plugin-transform-react-pure-class-to-function'),
                                          require.resolve('babel-plugin-transform-react-remove-prop-types'),
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
                  "test": /\.(woff(2)?)(\?[a-z0-9=&.]+)?$/,
                  "loader": "url-loader?limit=10000&name=fonts/[name].[ext]"
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
                  "test": /\.svg$/,
                  "use": [
                      {
                          "loader": "svg-inline-loader"
                      },
                      {
                          "loader": "svgo-loader",
                          "options": {
                              "plugins": [
                                  {
                                      "removeTitle": true
                                  },
                                  {
                                      "convertColors": {
                                          "shorthex": false
                                      }
                                  },
                                  {
                                      "convertPathData": false
                                  }
                              ]
                          }
                      }
                  ]
              }
          ]
      },
      "plugins": [
          new webpack.optimize.OccurrenceOrderPlugin(),
          new HtmlWebpackPlugin(props.html),
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
                  "use": [
                      ExtractTextPlugin.extract({
                          fallback: "style-loader",
                          use: { loader: 'css-loader', options: { minimize: true }}
                      })
                  ]
              },
              {
                  "test": /\.scss/,
                  "use": ExtractTextPlugin.extract({
                     fallback: "style-loader",
                     use: [
                         { loader: 'css-loader', options: { minimize: true }},
                         'sass-loader'
                     ]
                 })
              },
              {
                  "test": /\.less/,
                  "use":  ExtractTextPlugin.extract({
                     fallback: "style-loader",
                     use: [
                         { loader: 'css-loader', options: { minimize: true }},
                         'less-loader'
                     ]
                 })
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
                                  require.resolve('babel-plugin-transform-decorators-legacy')
                              ],
                              "env": {
                                  "production": {
                                      "plugins": [
                                          require.resolve('babel-plugin-transform-react-constant-elements'),
                                          require.resolve('babel-plugin-transform-react-inline-elements'),
                                          require.resolve('babel-plugin-transform-react-pure-class-to-function'),
                                          require.resolve('babel-plugin-transform-react-remove-prop-types'),
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
                  "test": /\.(woff(2)?)(\?[a-z0-9=&.]+)?$/,
                  "loader": "url-loader?limit=10000&name=fonts/[name].[ext]"
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
                  "test": /\.svg$/,
                  "use": [
                      {
                          "loader": "svg-inline-loader"
                      },
                      {
                          "loader": "svgo-loader",
                          "options": {
                              "plugins": [
                                  {
                                      "removeTitle": true
                                  },
                                  {
                                      "convertColors": {
                                          "shorthex": false
                                      }
                                  },
                                  {
                                      "convertPathData": false
                                  }
                              ]
                          }
                      }
                  ]
              }
          ]
      },
      "plugins": [
          new webpack.optimize.OccurrenceOrderPlugin(),
          new HtmlWebpackPlugin(props.html),
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
          new UglifyJSPlugin({
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