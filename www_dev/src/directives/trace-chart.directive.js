'use strict';

var _ = require('lodash')
 , d3 = window.d3;

module.exports = function () {
  return {
    restrict: 'E',
    scope: {
      trace: '='
    },
    link: function ($scope, $element) {

      var startSpan = $scope.trace.spans[0][0];
      var endSpan = $scope.trace.spans[$scope.trace.spans.length - 1][0];
      var traceLen = endSpan.ts - startSpan.ts;
      var spans = _.map(
        $scope.trace.spans.slice(1, $scope.trace.spans.length - 1),
        getDrawableSpan
      );

      function getDrawableSpan (span) {
        var s = span[0]
          , e = span[span.length - 1];

        var spanLen = (e.ts - s.ts);

        return {
          // Get width as a percentage
          width: (spanLen / traceLen) * 100,
          name: s.name
        };
      }

  //     d3.select(".chart")
  // .selectAll("div")
  //   .data(data)
  // .enter().append("div")
  //   .style("width", function(d) { return d * 10 + "px"; })
  //   .text(function(d) { return d; });

      d3.select($element[0])
        .selectAll('.chart')
        .data(spans)
          .enter()
          .append('p')
          .style(
            'width',
            function (s) {
              return Math.floor(s.width) + '%';
            }
          )
          .style(
            'border-radius',
            '1em'
          )
          .style(
            'padding',
            '0.25em 0'
          )
          .style(
            'overflow',
            'hidden'
          )
          .style(
            'text-overflow',
            'ellipsis'
          )
          .style(
            'background-color',
            '#cecece'
          )
          .style(
            'text-align',
            'center'
          )
          .style(
            'margin-left',
            function (s) {
              return Math.floor(getLeftMarginForSpan(s)) + '%';
            }
          )
          .text(function(s) { return s.name; });

      function getLeftMarginForSpan (s) {
        return _.reduce(spans.slice(0, spans.indexOf(s)), function (memo, s) {
          return memo + s.width;
        }, 0);
      }
    }
  };
};
