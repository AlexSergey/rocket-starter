let path = require('path');

const getOutput = (conf = {}, root, version = '') => {
    let outputProps = {
        publicPath: conf.url,
        path: path.resolve(root, conf.dist),
        filename: chunkData => {
            return chunkData.chunk.name === 'main' ?
                (version ? `index-${version}.js` : 'index.js')
                : version ? `[name]-${version}.js` : '[name].js';
        }
    };

    if (conf.library) {
        Object.assign(outputProps, {
            library: conf.library,
            libraryTarget: 'umd',
            globalObject: 'this'
        });
    }

    return outputProps;
};

module.exports = getOutput;
