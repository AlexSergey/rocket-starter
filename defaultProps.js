const defaultProps = {
    dist: 'dist',
    src: 'src/index.js',
    url: '/',
    server: {
        port: 3000,
        host: 'localhost'
    }
    /*
    Other Props:
    * library: 'test',
    * styles: String,
    * html: { // You can also add array for multi-pages support
    *     title: String,
    *     favicon: ...,
    *     version: Boolean,
    *     template: String, path to file
    * }
    * cache: '/tmp',
    * banner: String,
    * global: {
    *     key: value
    * },
    * copy: {from: ... to: ...} || [] || {files: [], opts: {}}
    * */
};

module.exports = defaultProps;