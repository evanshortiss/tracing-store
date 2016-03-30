'use strict';

var _ = require('lodash')
 , d3 = require('d3');

module.exports = function ($compile) {
  return {
    restrict: 'E',
    scope: {
      trace: '='
    },
    link: function ($scope, $element) {

      var bgClasses = [
        'mdc-bg-red-500',
        'mdc-bg-blue-grey-500',
        'mdc-bg-purple-500',
        'mdc-bg-pink-500',
        'mdc-bg-deep-orange-500',
        'mdc-bg-green-500',
        'mdc-bg-light-blue-500'
      ];
      var lastColour = null;

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
          name: s.name,
          time: (spanLen / 1000).toFixed(4)
        };
      }

      function getRandomColour() {
        var min = 0;
        var max = bgClasses.length - 1;
        var c = bgClasses[
          Math.floor(Math.random() * (max - min + 1) + min)
        ];

        if (c === lastColour) {
          return getRandomColour()
        } else {
          lastColour = c;

          return lastColour;
        }
      }


      d3.select($element[0])
        .selectAll('.chart')
        .data(spans)
          .enter()
          .append('p')
          .attr(
            'class',
            getRandomColour
          )
          .transition()
          .style(
            'border-radius',
            '1em'
          )
          .style(
            'padding',
            '0.25em 0.2em'
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
            'text-align',
            'center'
          )
          .style(
            'color',
            '#fff'
          )
          .style(
            'margin-left',
            function (s) {
              return Math.floor(getLeftMarginForSpan(s)) + '%';
            }
          )
          .style(
            'width',
            function (s) {
              return Math.floor(s.width) + '%';
            }
          )
          .delay(0);

      // Set the heights after a delay
      setTimeout(function () {
        _.each($element.find('p'), function (p) {
          p.style.height = '1.25em';
        });
      }, 600);

      // Insert the runtime for each section after a delay
      setTimeout(function () {
        var ps = $element.find('p');

        _.each(ps, function (p, idx) {
          var el = window.angular.element(document.createElement('md-tooltip'));
          el.text('Runtime: ' + spans[idx].time + ' seconds');
          el.attr('md-direction', 'bottom');

          window.angular.element(p).append(el);

          $compile(
            el
          )($scope);

          window.angular.element(p).text(spans[idx].name);
        });
      }, 1000);

      function getLeftMarginForSpan (s) {
        return _.reduce(spans.slice(0, spans.indexOf(s)), function (memo, s) {
          return memo + s.width;
        }, 0);
      }
    }
  };
};
