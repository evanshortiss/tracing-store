'use strict';

var app = module.exports = angular.module('TracingStore.Services', []);

app
  .service('TracingAPI', require('./trace-api.service.js'));
