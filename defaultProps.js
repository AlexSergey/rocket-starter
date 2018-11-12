const defaultProps = {
    dist: 'dist',
    src: 'src/index',
    url: '/',
    debug: false,
    stats: false,
    write: false,
    nodejs: false,
    server: {
        browserSyncPort: false,
        port: 3000,
        host: 'localhost'
    }
    /*
    Other Props:
    * dotenv: 'path_to_dotend or put .env file to your project',
    * version: true,
    * library: 'test',
    * styles: String,
    * html: { // You can also add array for multi-pages support
    *     title: String,
    *     favicon: ...,
    *     version: Boolean,
    *     template: String, path to file
    * }
    * banner: String,
    * global: {
    *     key: value
    * },
    * copy: {from: ... to: ...} || [] || {files: [], opts: {}}
    * */
};

module.exports = defaultProps;
