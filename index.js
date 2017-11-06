const { customize } = require('./modules/build');
const { getWebpack } = require('./modules/configGenerators');

const { compile } = require('./modules/compile');

module.exports = {
    customize,
    getWebpack,
    compile
};