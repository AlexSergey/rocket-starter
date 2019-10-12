const commonMultiValidators = require('../utils/commonMultiValidators');
const multiCompiler = require('./multiCompiler');
const tmp = require('tmp');

async function isomorphicCompiler(props = []) {
    commonMultiValidators(props);

    let backend = props.find(p => p.compiler.name === 'backendCompiler');

    if (!backend) {
        console.error('The config is empty');
        return process.exit(1);
    }

    if (Object.keys(props) <= 1) {
        console.error('The config is empty');
        return process.exit(1);
    }
    let { name, removeCallback } = tmp.dirSync();

    if (!backend.config.dist) {
        backend.config.dist = name;
    }
    return await multiCompiler(props);
}

module.exports = isomorphicCompiler;
