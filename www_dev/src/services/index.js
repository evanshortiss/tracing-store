'use strict';

var angular = require('angular');

var app = module.exports = angular.module('TracingStore.Services', []);

app
  .service('TracingAPI', require('./trace-api.service.js'));
