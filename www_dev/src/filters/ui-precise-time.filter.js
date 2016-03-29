'use strict';

var moment = require('moment');

module.exports = function () {
  return function (input) {
    return moment(input).toJSON();
  };
};
