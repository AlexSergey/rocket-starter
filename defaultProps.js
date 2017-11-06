const defaultProps = {
    dist: 'dist',
    src: 'src/index.js',
    sourcemap: 'source-map',
    server: {
        port: 3000,
        host: 'localhost'
    }
    /*
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
    * }
    * */
};

module.exports = defaultProps;