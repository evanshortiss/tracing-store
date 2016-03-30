'use strict';

var fmt = require('format-number')({
  integerSeparator: ','
});

module.exports = function () {
  return function (input) {
    return fmt(input);
  };
};
