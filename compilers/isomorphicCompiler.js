const commonMultiValidators = require('../utils/commonMultiValidators');
const multiCompiler = require('./multiCompiler');
const tmp = require('tmp');
const { isDefined, isUndefined } = require('valid-types');
const errors = require('../errors/isomorphicCompiler');

async function isomorphicCompiler(props = []) {
    commonMultiValidators(props);

    let backend = props.find(p => p.compiler.name === 'backendCompiler');

    if (!backend) {
        console.error(errors.BACKEND_IS_REQUIRED);
        return process.exit(1);
    }

    if (Object.keys(props) <= 1) {
        console.error(errors.SHOULD_SET_MORE_THEN_ONE_COMPILERS);
        return process.exit(1);
    }

    props.forEach(prop => {
        if (prop.compiler.name === 'backendCompiler') {
            if (isUndefined(prop.config.src)) {
                console.error(errors.SHOULD_SET_OPTION(prop.compiler.name, 'src'));
                return process.exit(1);
            }
        } else {
            ['dist', 'src'].forEach(option => {
                if (isUndefined(prop.config[option])) {
                    console.error(errors.SHOULD_SET_OPTION(prop.compiler.name, option));
                    return process.exit(1);
                }
            });
        }
    });

    let { name, removeCallback } = tmp.dirSync();

    backend.config.dist = isDefined(backend.config.dist) ? backend.config.dist : name;

    let compilers = props.filter(p => p.compiler.name === 'frontendCompiler' || p.compiler.name === 'libraryCompiler');

    compilers.forEach(prop => {
        prop.config.write = isDefined(prop.config.write) ? prop.config.write : true;
        prop.config.html = isDefined(prop.config.html) ? prop.config.html : false;
        prop.config.onlyWatch = isDefined(prop.config.onlyWatch) ? prop.config.onlyWatch : true;
    });

    return await multiCompiler(props);
}

module.exports = isomorphicCompiler;
