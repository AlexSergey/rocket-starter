let { compile } = require('../../index');
let { resolve } = require('path');

compile({
    html: [
        {
            template:  resolve(__dirname, 'src/jade_test.jade')
        },
        {
            template:  resolve(__dirname, 'src/html_test.html')
        },
        {
            template:  resolve(__dirname, 'src/handlebars_test.hbs')
        },
        {
            template:  resolve(__dirname, 'src/nunjucks_test.njk')
        }
    ]
});