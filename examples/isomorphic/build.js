const { isomorphicCompiler, backendCompiler, frontendCompiler } = require('../../');

isomorphicCompiler([
    {
        compiler: backendCompiler,
        config: {
            src: 'backend/src/index.jsx'
        }
    },
    {
        compiler: frontendCompiler,
        config: {
            src: 'client/src/index.jsx',
            dist: 'backend/dist'
        }
    }
]);
