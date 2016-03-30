'use strict';

var app = module.exports = angular.module('TracingStore.Filters', []);

app
  .filter('uiDate', require('./ui-date.filter.js'))
  .filter('uiDatetime', require('./ui-datetime.filter.js'))
  .filter('uiPreciseTime', require('./ui-precise-time.filter.js'))
  .filter('kebabCase', require('./kebab-case.filter.js'))
  .filter('sentenceCase', require('./sentence-case.filter.js'))
  .filter('msToSeconds', require('./ms-seconds.filter.js'))
  .filter('number', require('./number.filter.js'));
