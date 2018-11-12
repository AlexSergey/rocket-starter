const path = require('path');
let { compile } = require('../../index');

compile({
    nodejs: true
}, finalConfig => {
    Object.assign(finalConfig.resolve, {
        alias: {
            text: path.resolve('./text'),
            ttt: path.resolve('../../../../../ttt/node_modules/fabric'),
        }
    });
});