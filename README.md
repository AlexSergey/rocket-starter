# This is experimental!

```jsx
const {
    getWebpack,
    getBuildVersion,
    getTitle,
    getEntry,
    makeBanner,
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
} = require('rocket-starter');

const webpack = getWebpack();
const title = getTitle(packageJson);
const version = getBuildVersion();
const entry = getEntry();
const banner = makeBanner(packageJson);
const devtool = getDevtool();
const output = getOutput({
    path: path.resolve(__dirname, 'dist'),
    filename: `[name]-${version}.js`
});
const modules = getModules();
const stats = getStats();
const devServer = getDevServer();
const resolve = getResolve();
const node = getNode();

let plugins = makePlugins(getPlugins(), {
    ExtractTextPlugin: {
        path: 'css/styles.css'
    },
    ImageminPlugin: {
        disable: false
    },
    CleanWebpackPlugin: {
        path: path.resolve(__dirname, './dist'),
        root: __dirname
    },
    UglifyJSPlugin: {
        sourceMap: false
    },
    HtmlWebpackPlugin: {
        title: title,
        version: version
    }
});

plugins.push(
    new webpack.IgnorePlugin(/jsdom$/)
);
plugins.push(
    new webpack.IgnorePlugin(/xmldom$/)
);

module.exports = createConfig(
    entry,
    devtool,
    output,
    modules,
    plugins,
    stats,
    devServer,
    node,
    resolve,
    banner
);
```