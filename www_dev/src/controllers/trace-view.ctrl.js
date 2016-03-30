'use strict';

var log = require('fhlog').get(__filename);

module.exports = function (trace) {
  log.i('creating trace-view controller');

  (function (vm) {
    vm.trace = trace;


    vm.getSpanDuration = function (span) {
      return span[span.length - 1].ts - span[0].ts;
    };

    vm.getProcessingTime = function () {
      var e = trace.spans[trace.spans.length - 1][0];
      var s = trace.spans[0][0];

      return (
        (e.ts - s.ts) / 1000
      ).toFixed(4);
    };

    vm.isSingleEvent = function (span) {
      return span.length === 1;
    };

    vm.getIndent = function (span) {
      var idx = trace.spans.indexOf(span);

      if (idx === 0 || idx === trace.spans.length - 1) {
        return 0;
      } else {
        return 1;
      }
    };

  })(this);
};
