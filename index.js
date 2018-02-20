const { customize, mix } = require('./modules/customization');
const { getWebpack, getArgs } = require('./modules/configGenerators');
const { compile } = require('./modules/compile');
const { make } = require('./modules/make');

module.exports = {
    mix,
    customize,
    getWebpack,
    compile,
    getArgs,
    make
};
