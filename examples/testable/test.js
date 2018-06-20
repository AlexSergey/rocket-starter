const config = require('./config');
const { make, getArgs } = require('../../index');
const tester = require('../../../rocket-tester');
const { join } = require('path');

(async() => {
    let c = await make(config);

    tester(c, {
        root: join(__dirname, 'src'),
        watch: !!getArgs().watch
    });
})();