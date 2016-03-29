'use strict';

var browserify = require('browserify')
  , path = require('path');

module.exports = function (app) {
  var route = require('express').Router();

  route.get('/bundle.js', function (req, res) {
    var b = browserify();

    b.add(
      path.join(__dirname, '../../www_dev/src/index.js')
    );

    b
      .bundle()
      .pipe(res);
  });
  
  app.use('/js', route);
};
