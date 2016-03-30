'use strict';

var app = module.exports = angular.module('TracingStore.Directives', []);

app
  .directive('traceChart', require('./trace-chart.directive.js'))
  .directive('traceAccordion', require('./accordion.directive.js'));
