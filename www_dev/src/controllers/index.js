'use strict';

var angular = require('angular');

var app = module.exports = angular.module('TracingStore.Controllers', []);

app
  .controller('DashboardCtrl', require('./dashboard.ctrl.js'))
  .controller('AppViewCtrl', require('./app-view.ctrl.js'))
  .controller('TraceViewCtrl', require('./trace-view.ctrl.js'));
