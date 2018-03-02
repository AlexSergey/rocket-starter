let { compile } = require('../../index');
let { resolve } = require('path');

compile({
    html: {
        template:  resolve(__dirname, 'src/index.jade')
    }
});