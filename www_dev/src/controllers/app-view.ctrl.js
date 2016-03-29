'use strict';

var log = require('fhlog').get(__filename);

module.exports = function (recentTraces, appInfo) {
  log.i('creating app-view controller');

  (function (vm) {

    vm.traces = recentTraces;
    vm.appInfo = appInfo;

    /**
     * Get the initial event for this trace
     * @param  {Object} trace
     * @return {Number}
     */
    vm.getStartTime = function (trace) {
      return trace.createTs || trace.spans[0][0].ts;
    };


    /**
     * Returns the total time for request processing
     * @param  {[type]} trace [description]
     * @return {[type]}       [description]
     */
    vm.getTotalTimeForTrace = function (trace) {
      var s = trace.spans[0][0].ts
        , e = trace.spans[trace.spans.length - 1][0].ts;

      return ((e - s) / 1000).toFixed(2) + ' seconds';
    };

  })(this);
};
