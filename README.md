# This is experimental!

You need to create webpack config file in new app directory.

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
    sourcemap: 'source-map',
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
    sourcemap: 'source-map',
    server: {
        port: 3000,
        host: 'localhost'
    }
    // secondary properties
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