# This is experimental!

You need to create webpack config file in new app directory.

```jsx
const { iWantTo, customize } = require('rocket-starter');
```
### If you want build a library, you need to declarate this config.
When you start webpack it will be make only JS file, without styles and HTML and other media resources.
```jsx
module.exports = iWantTo.library({
    root: __dirname,
    src: 'source/index.js',
    dist: 'dist',
    name: 'ReSock'
});
```

### If you want build a Application, you need to declarate this config.
When you start webpack it will be make HTML, media, JS etc
```jsx
module.exports = iWantTo.library({
    root: __dirname,
    src: 'source/index.js',
    dist: 'dist',
    name: 'ReSock'
});
```
You can run it with NODE_ENV=production - it is active uglifier and styles extraction

### If you need to customize your config, you can use middlewares.

Middlewares divided to PRE and POST.

In PRE case, you catch all data before config will created
In POST case, you catch created config file.

Middlewares might be as object ({pre: []|fn, post:[]|fn}) or function.
If you send middleware as function it will be run as PRE middleware.
```
module.exports = iWantTo.library(customize({
    root: __dirname,
    src: 'source/index.js',
    dist: 'dist',
    name: 'ReSock'
}, (...args) => {

}));
```
### Or:
```
module.exports = iWantTo.library(customize({
    root: __dirname,
    src: 'source/index.js',
    dist: 'dist',
    name: 'ReSock'
}, {
    pre: [fn, fn] || fn,
    post: [fn, fn] || fn
};
```