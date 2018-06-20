let path = require('path');

const getOutput = (conf = {}, root, version = '') => {
    let outputProps = {
        publicPath: conf.url,
        path: path.resolve(root, conf.dist),
        filename: version ? `[name]-${version}.js` : `[name].js`
    };

    if (conf.library) {
        Object.assign(outputProps, {
            library: conf.library,
            libraryTarget: 'umd'
        });
    }

    return outputProps;
};

module.exports = getOutput;