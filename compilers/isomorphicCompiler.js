const commonMultiValidators = require('../utils/commonMultiValidators');
const multiCompiler = require('./multiCompiler');
const { isDefined, isUndefined } = require('valid-types');
const errors = require('../errors/isomorphicCompiler');
const makeMode = require('../modules/makeMode');

async function isomorphicCompiler(props = []) {
    commonMultiValidators(props);
    let mode = makeMode();

    let backend = props.find(p => p.compiler.name === 'backendCompiler');

    let compilers = props.filter(p => p.compiler.name === 'frontendCompiler');

    if (!compilers.length) {
        console.error(errors.SUPPORT);
        return process.exit(1);
    }

    if (!backend) {
        console.error(errors.BACKEND_IS_REQUIRED);
        return process.exit(1);
    }

    if (Object.keys(props) <= 1) {
        console.error(errors.SHOULD_SET_MORE_THEN_ONE_COMPILERS);
        return process.exit(1);
    }

    props.forEach(prop => {
        ['dist', 'src'].forEach(option => {
            if (isUndefined(prop.config[option])) {
                console.error(errors.SHOULD_SET_OPTION(prop.compiler.name, option));
                return process.exit(1);
            }
        });
    });

    if (mode === 'development') {
        props.forEach(prop => {
            prop.config.__isIsomorphicStyles = true;
        });
    }
    else {
        backend.config.__isIsomorphicStyles = true;
    }

    props.forEach(prop => {
        prop.config.__isIsomorphicLoader = true;
    });

    compilers.forEach(prop => {
        prop.config.write = isDefined(prop.config.write) ? prop.config.write : true;
        prop.config.html = isDefined(prop.config.html) ? prop.config.html : false;
        if (mode === 'development') {
            prop.config.onlyWatch = isDefined(prop.config.onlyWatch) ? prop.config.onlyWatch : true;
        }
    });

    return await multiCompiler(props);
}

module.exports = isomorphicCompiler;
