'use strict';

var util = require('util')
  , log = require(__filename);

module.exports = function (appsList, TraceAPI, $mdToast) {
  (function (vm) {

    vm.appsList = appsList;

    vm.selectedApp = '';

    vm.traces = [];


    /**
     * Loads recent traces for the value of selectedApp
     *
     * On failure an error is displayed.
     * On success traces are rendered in a list.
     */
    vm.getTracesForApplication = function () {
      if (vm.selectedApp) {
        TraceAPI.getTracesForApplication(vm.selectedApp)
          .then(onTracesLoadSuccess)
          .catch(onTraceLoadFailed);
      }
    };


    /**
     * Called on a successful load of traces by $http
     * @param  {Object} response
     */
    function onTracesLoadSuccess (res) {
      vm.traces = res.data;
    }


    /**
     * Called on a successful load of traces by $http
     * @return {[type]} [description]
     */
    function onTraceLoadFailed (res) {
      log.e('failed to load traces. status code: %s', res.status);

      var toast = $mdToast.show(
        $mdToast.simple().textContent(
          util.format(
            'Failed to load recent traces for app %s', vm.selectedApp
          )
        )
      );

      setTimeout(toast.hide.bind(toast), 2500);
    }


  })(this);
};
