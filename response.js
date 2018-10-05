'use strict';

const dir = ["true", "1", 1, true].indexOf(process.env.DEVELOPER) != -1 ? 'src' : 'lib'; 

const response = require('./' + dir + '/response');

module.exports = response.default;