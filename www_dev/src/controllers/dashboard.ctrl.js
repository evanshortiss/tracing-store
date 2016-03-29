'use strict';

var log = require('fhlog').get(__filename);

module.exports = function (appsList) {
  log.i('creating dashboard controller');

  (function (vm) {

    vm.appsList = appsList;
    
  })(this);
};
