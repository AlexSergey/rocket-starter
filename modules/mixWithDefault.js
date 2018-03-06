/**
 * Created by Sergey Aleksandrov (gooddev.sergey@gmail.com) on 06.11.2017.
 */
const { existsSync } = require('fs');
let defaultProps = require('../defaultProps');
const path = require('path');
const { isString, isBoolean, isArray } = require('./typeChecker');
const { getTitle, getBuildVersion, makeBanner } = require('./configGenerators');

module.exports = function(props = {}) {
    let newProps = {};
    const root = path.dirname(require.main.filename);
    const packageJson = existsSync(path.resolve(root, 'package.json')) ? require(path.resolve(root, 'package.json')) : {};

    newProps.packageJson = packageJson;
    newProps.root = root;
    newProps.dist = props.dist || defaultProps.dist;
    newProps.src = props.src || defaultProps.src;
    newProps.styles = props.styles || false;
    newProps.sourcemap = props.sourcemap || defaultProps.sourcemap;
    newProps.url = props.url || defaultProps.url;
    newProps.global = props.global || {};
    newProps.library = props.library || false;
    newProps.middlewares = props.middlewares;

    let banner = makeBanner(packageJson, props.root);

    if (props.banner) {
        if (isString(props.banner)) {
            banner = props.banner;
        }
    } else {
        if (isBoolean(props.banner)) {
            banner = false;
        }
    }
    newProps.banner = banner;
    let version = getBuildVersion();

    if (version) {
        newProps.build_version = version;
    }
    newProps.html = {
        pages: []
    };

    if (props.html && isArray(props.html)) {
        newProps.html.pages = props.html;
    }
    else {
        newProps.html.pages = [
            {
                title: (props.html && props.html.title) || getTitle(packageJson),
                favicon: (props.html && props.html.favicon) ? props.html.favicon : null,
                template: (props.html && props.html.template) || path.resolve(__dirname, '..', './index.ejs')

            }
        ];
    }
    newProps.html.pages = newProps.html.pages.map(page => {
        if (version) {
            page.version = version;
        }
        if (!page.template) {
            page.template = path.resolve(__dirname, '..', './index.ejs');
        }
        if (!page.filename) {
            page.filename = page.template.slice(page.template.lastIndexOf('/') + 1, page.template.lastIndexOf('.'));
            page.filename += '.html';
        }
        return page;
    });

    newProps.copy = props.copy || false;
    newProps.server = Object.assign({}, defaultProps.server, props.server);

    return newProps;
};
