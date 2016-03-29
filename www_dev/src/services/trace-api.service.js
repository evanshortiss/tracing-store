'use strict';

var path = require('path');

module.exports = function ($http) {

  function extractData (response) {
    return response.data;
  }

  this.getAppsList = function () {
    return $http.get('/trace/apps').then(extractData);
  };

  this.getTracesForApp = function (app) {
    return $http.get(
      path.join('trace', 'apps', app.toString(), 'traces')
    ).then(extractData);
  };

  this.getAppInfo = function (appId) {
    return $http.get(
      path.join('trace', 'apps', appId.toString())
    ).then(extractData);
  };

  this.getTraceById = function (id) {
    return $http.get(
      path.join('trace', id.toString())
    ).then(extractData);
  };

};
