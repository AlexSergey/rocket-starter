This is the simplest way to make webpack config with many default settings.
This config-generator include modules and features:

- Webpack 4+, Webpack-dev-server
- Babel 6, Babel-preset-env (> 5%)
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
- Uglifyjs (+parallel)
- Hard Source Plugin (in production mode)
- Generate stats.json (in production mode)

See to examples folder

```jsx
const compile = require('rocket-starter');
```
### If you want build a library, you need to set this config.
When you start webpack it will be make only JS file, without styles and HTML and other media resources. JS will be build as UMD format.
```jsx
compile({library: 'MyLib'});
```
### Or:
```jsx
compile();
```
### If you want build a Application, you need to set this config.
When you start webpack it will be make HTML, media, JS etc
```jsx
compile({src: 'app.js' ... });
```
You can run it with NODE_ENV=production - it is active uglifier. If you want a styles extraction you need to set styles: 'mystyle.css'

### If you need to customize your config, you can set second argument - callback function.

```jsx
compile({
    src: 'source/index.js',
    dist: 'dist',
}, (...args) => {

});
```

### Default properties:

```jsx
{
    dist: 'dist',
    src: 'src/index.js',
    url: '/',
    debug: false,
    stats: false,
    write: false,
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
    debug: false, // if you need to debug in production
    stats: false,
    write: false,
    server: {
        port: 3000,
        host: 'localhost'
    }
    // secondary properties
    dotenv: 'path_to_dotend or put .env file to your project',
    version: false,
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

"write" will force Webpack to save file in HDD after each update webpack watcher / dev-server

If you don't need to extract styles to css file in production version you can set styles: false

You can add eslint config. Just add eslintrc.js in your main (project) dir.

You can add postcss config. Just add postcss.config.js  in your main (project) dir.

Add .flowconfig to root folder and that activation flow-type checking
