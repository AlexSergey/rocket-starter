const makeDevtool = (mode, conf) => {
    let sourceMap = mode === 'development' ? 'eval' : false;

    if (mode === 'production' && conf.debug) {
        sourceMap = 'source-map';
    }

    return sourceMap;
};

module.exports = makeDevtool;
