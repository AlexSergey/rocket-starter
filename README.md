# Rocket Starter

This is the simplest way to make webpack config with many default settings.
This config-generator include modules and features:

- Webpack 4+, Webpack-dev-server
- TypeScript support
- Babel 7, Babel-preset-env (> 5%)
- Support build nodejs scripts with nodemon
- Dotenv support
- React optimizations
- Flow
- Write file webpack plugin (in dev mode)
- Postcss: Autoprefixer, Mqpacker, Lost, Instagram filters, Autoprefixer, Rucksack
- Copy Webpack Plugin
- ESLint
- Templates: HTML/Jade/Handlebars,nunjucks
- CSS: CSS/SASS/LESS + Postcss
- Imagemin
- File import support: Markdown, Video, Audio, Fonts, SVG, Script, Shaders etc
- SVG + SVGO
- Uglifyjs (terser)
- Hard Source Plugin (in production mode)
- Generate stats.json (in production mode)
- SEO Optimizations
- Bundle Analyzer

## How it works
You have 4 compilers for your scripts

```jsx
const { frontendCompiler, backendCompiler, libraryCompiler, markupCompiler } = require('rocket-starter');
```
all of these compilers can get options object and callback. Callback is a function that will run after your webpack config will compile. This can help you for override some properties (You can see example below).

### frontendCompiler(options[optional], callback[optional]);
can compile any frontend application (React, TypeScript, flow, etc)
```jsx
const { frontendCompiler } = require('rocket-starter');

frontendCompiler(options, webpackConfig => {
    Object.assign(finalConfig.resolve, {
        alias: // add some aliases
    });
});
```
### backendCompiler(options[optional], callback[optional]);
can compile nodejs scripts. Can run nodemon.
```jsx
const { backendCompiler } = require('rocket-starter');

backendCompiler(options || {
    nodemon: // path to file that will run from nodemon
}, webpackConfig => {
    Object.assign(finalConfig.resolve, {
        alias: // add some aliases
    });
});
```
### libraryCompiler(libraryName[needed], options[optional], callback[optional]);
can compile UMD library
```jsx
const { libraryCompiler } = require('rocket-starter');

libraryCompiler('MyLib', options, webpackConfig => {
    Object.assign(finalConfig.resolve, {
        alias: // add some aliases
    });
});
```
### markupCompiler(paths[needed], options[optional], callback[optional]);
can compile markup (HTML, handlebars, jade, nunjucks)
```jsx
const { markupCompiler } = require('rocket-starter');

markupCompiler(
    './src/**/*.{html,hbs,jade,njk}', // supported Glob format
     options,
     webpackConfig => {
         Object.assign(finalConfig.resolve, {
             alias: // add some aliases
         });
    });
```

#### Default Options:

```jsx
{
    dist: 'dist',
    src: 'src/index',
    url: '/',
    debug: false, // Activate debug mode in all plugins or loaders
    stats: false, // Generate stats webpack file
    write: false, // Write files to HDD after changes (watch mode)
    base64: true, // Convert images to base64 in your CSS
    analyzerPort: false, //port number, for example: 8888
    server: {
        browserSyncPort: false, // run with browser-sync
        port: 3000,
        host: 'localhost'
    }
}
```

#### All Options

```jsx
{
    dist: 'dist',
    src: 'src/index',
    url: '/',
    debug: false, // Activate debug mode in all plugins or loaders
    stats: false, // Generate stats webpack file
    write: false, // Write files to HDD after changes (watch mode)
    base64: true, // Convert images to base64 in your CSS
    analyzerPort: false, //port number, for example: 8888
    server: {
        browserSyncPort: false, // run with browser-sync
        port: 3000,
        host: 'localhost'
    }
    // secondary properties
    nodemon: path to nodemon run file (only for backendCompiler)
    dotenv: 'path_to_dotend or put .env file to your project',
    version: false, // You can add version to script's filenames
    styles: String, // You can extract CSS styles from scripts, or disable it - set false
    html: { // CopyWebpackPlugin. You can also add array for multi-pages support
        title: String,
        favicon: ...,
        version: Boolean,
        template: String, path to file
    }
    banner: String, // You can set banner in the head of scripts
    global: { // DefinePlugin activate
        var: 'var1'
    },
    copy: {from: ... to: ...} || [] || {files: [], opts: {}}
}
```
TypeScript activation:
- make tsconfig.json
- add config (Example: https://www.typescriptlang.org/docs/handbook/react-&-webpack.html) 

You can run it with NODE_ENV=production - it is active uglifier. 

If you want a styles extraction you need to set styles: 'mystyle.css'

If you don't need to extract styles to css file in production version you can set styles: false

"copy" is activate CopyWebpackPlugin and we can use default syntax but we can set files and opts. Opts is second parameter in this plugin.

"write" will force Webpack to save file in HDD after each update webpack watcher / dev-server

You can add eslint config. Just add eslintrc.js in your main (project) dir.

You can add postcss config. Just add postcss.config.js  in your main (project) dir.

Add .flowconfig to root folder and that activation flow-type checking