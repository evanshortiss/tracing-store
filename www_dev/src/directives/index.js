'use strict';

var angular = require('angular');

var app = module.exports = angular.module('TracingStore.Directives', []);

app
  .directive('traceChart', require('./trace-chart.directive.js'));
