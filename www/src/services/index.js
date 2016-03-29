'use strict';

var angular = require('angular');

var app = module.exports = angular.app('TracingStore.Services', []);

app
  .controller('TracingAPI', require('trace-api.service.js'));
