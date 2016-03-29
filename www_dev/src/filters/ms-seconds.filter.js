'use strict';

module.exports = function () {
  return function (input) {
    return (input / 1000).toFixed(2) + ' seconds';
  };
};
