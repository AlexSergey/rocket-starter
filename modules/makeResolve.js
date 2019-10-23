const path = require('path');

const makeResolve = (root) => {
    return {
        extensions: [
            '.ts',
            '.tsx',
            '.js',
            '.jsx',
            '.vue'
        ],
        modules: [
            path.resolve(root, 'node_modules')
        ]
    };
};

module.exports = makeResolve;
