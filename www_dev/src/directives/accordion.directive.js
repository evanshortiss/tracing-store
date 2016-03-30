'use strict';

module.exports = function ($timeout) {
  return {
    restrict: 'E',
    scope: {
      name: '@'
    },
    templateUrl: '/tpl/accordion.html',
    transclude: true,
    link: function ($scope, $element) {
      $scope.open = true;

      var height = 'inherits';

      $scope.getHeight = function () {
        if ($scope.open) {
          return height;
        } else {
          return 0 + 'px';
        }
      };

      $scope.toggle = function () {
        if ('inherits' === height) {
          height = $element.find('md-content')[0].offsetHeight + 'px';
        }

        $timeout(function () {
          $scope.open = !$scope.open;
        }, 50);
      };

    }
  };
};
