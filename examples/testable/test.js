const config = require('./config');
const { make, getArgs } = require('../../index');
const tester = require('rocket-tester');
const { join } = require('path');

tester(make(config), {
    root: join(__dirname, 'src'),
    watch: !!getArgs().watch
});