const defaultProps = {
    dist: 'dist',
    src: 'src/index.js',
    server: {
        port: 3000,
        host: 'localhost'
    }
    /*
    Other Props:
    * sourcemap: 'source-map',
    * library: 'test',
    * styles: String,
    * html: {
    *     title: String,
    *     version: Boolean,
    *     template: String, path to file
    * }
    * banner: String,
    * global: {
    *     key: value
    * },
    * copy: {from: ... to: ...} || [] || {files: [], opts: {}},
    * analyzer: true
    * */
};

module.exports = defaultProps;