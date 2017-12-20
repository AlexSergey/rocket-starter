/**
 * Created by Sergey Aleksandrov (gooddev.sergey@gmail.com) on 06.11.2017.
 */
let defaultProps = require('../defaultProps');
const path = require('path');
const { isString, isBoolean } = require('./typeChecker');
const { getTitle, getBuildVersion, makeBanner } = require('./configGenerators');

module.exports = function(props = {}) {
    let newProps = {};
    const root = path.dirname(require.main.filename);
    const packageJson = require(path.resolve(root, 'package.json'));

    newProps.packageJson = packageJson;
    newProps.root = root;
    newProps.dist = props.dist || defaultProps.dist;
    newProps.src = props.src || defaultProps.src;
    newProps.styles = props.styles || false;
    newProps.sourcemap = props.sourcemap || defaultProps.sourcemap;
    newProps.global = props.global || {};
    newProps.library = props.library || false;
    newProps.middlewares = props.middlewares;

    let banner = makeBanner(packageJson, props.root);

    if (props.banner) {
        if (isString(props.banner)) {
            banner = props.banner;
        }
    }
    else {
        if (isBoolean(props.banner)) {
            banner = false;
        }
    }
    newProps.banner = banner;
    let version = getBuildVersion();

    if (version) {
        newProps.build_version = version;
    }

    newProps.html = {};
    newProps.html.title = props.html && props.html.title || getTitle(packageJson);
    if (version) {
        newProps.html.version =  version;
    }
    newProps.html.template =  props.html && props.html.template || path.resolve(__dirname, '..', './index.ejs');
    newProps.analyzer = props.analyzer || false;
    newProps.copy = props.copy || false;
    newProps.server = Object.assign({}, defaultProps.server, props.server);

    return newProps;
};