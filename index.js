const { customize, mix } = require('./modules/customization');
const { getWebpack } = require('./modules/configGenerators');

const { compile } = require('./modules/compile');

module.exports = {
    mix,
    customize,
    getWebpack,
    compile
};