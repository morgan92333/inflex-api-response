'use strict';

const dir = ["true", "1", 1, true].indexOf(process.env.DEVELOPER) != -1 ? 'src' : 'lib'; 

const response = require('./' + dir + '/request');

module.exports = response.default;