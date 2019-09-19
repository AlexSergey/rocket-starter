let { frontendCompiler } = require('../../index');

frontendCompiler({
    cssModules: true,
    banner: true,
    styles: 'style.css'
});
