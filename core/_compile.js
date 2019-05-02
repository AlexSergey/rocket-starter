const webpack = require('webpack');
const makeMode = require('../modules/makeMode');
const mergeConfWithDefault = require('../modules/mergeConfWithDefault');
const _make = require('./_make');
const run = require('../modules/run');

const _compile = async (conf = {}, post) => {
    let mode = makeMode();
    conf = await mergeConfWithDefault(conf, mode);
    conf.progress = true;
    const webpackConfig = await _make(conf, post);
    run(webpackConfig, mode, webpack, conf);
};

module.exports = _compile;