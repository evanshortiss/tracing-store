'use strict';

var angular = require('angular')
  , Promise = require('bluebird')
  , _ = require('lodash')
  , log = require('fhlog').get(__filename);



var app = module.exports = angular.module('TracingStore', [
  'ngRoute',
  'ngMaterial',
  'ngMdIcons',
  require('./services').name,
  require('./filters').name,
  require('./directives').name,
  require('./controllers').name
]);


app.config(function configApp ($routeProvider) {
  log.i('configuring routes');

  $routeProvider
    .when('/dashboard', {
      templateUrl: 'tpl/dashboard.html',
      controller: 'DashboardCtrl as dashCtrl',
      resolve: {
        // Need to get the list of applications plus their high-level data
        appsList: function (TracingAPI) {
          return TracingAPI.getAppsList()
            .then(function (data) {
              // Get details for each application
              return Promise.all(
                _.map(data, function (appId) {
                  return TracingAPI.getAppInfo(appId);
                })
              );
            });
        }
      }
    })
    .when('/trace/:traceId', {
      templateUrl: 'tpl/trace-view.html',
      controller: 'TraceViewCtrl as traceViewCtrl',
      resolve: {
        trace: function (TracingAPI, $route) {
          return TracingAPI.getTraceById($route.current.params.traceId);
        }
      }
    })
    .when('/app/:appId', {
      templateUrl: 'tpl/app-view.html',
      controller: 'AppViewCtrl as appViewCtrl',
      resolve: {
        recentTraces: function (TracingAPI, $route) {
          return TracingAPI.getTracesForApp($route.current.params.appId);
        },
        appInfo: function (TracingAPI, $route) {
          return TracingAPI.getAppInfo($route.current.params.appId);
        }
      }
    })
    .otherwise({
      redirectTo: '/dashboard'
    });

  log.i('routes configured');
});


app.run(function runApp () {
  log.i('application started');
});
