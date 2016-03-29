'use strict';

var express = require('express')
  , async = require('async')
  , log = require('fhlog').get(__filename)
  , tm = require('lib/dao/trace')
  , mongo = require('mongo-utils');

module.exports = function (app) {
  log.i('binding routes');

  var route = new express.Router();

  // Requests contain JSON bodies; parse them
  route.use(require('body-parser').json());

  // Can be used to POST new traces
  route.post('/', addTrace);

  //  GET a list of applications that have posted traces
  route.get('/apps', getApps);

  //  GET recent traces for the given application
  route.get('/apps/:appId/traces', getTracesForApplication);

  // GET in depth application information
  route.get('/apps/:appId', getApplicationInfo);

  // GET in depth details for a specific trace
  route.get('/:traceId', getTrace);

  // Error handler for this route
  route.use(function (err, req, res, next) {
    res.status(500).json({
      message: 'internal server error'
    });
  });

  // Bind this route to the passed in express application
  app.use('/trace', route);

  log.i('routes bound successfully');
};


/**
 * Get details for a specific trace
 * @param  {IncomingRequest}   req
 * @param  {OutgoingResposne}  res
 * @param  {Function}          next
 */
function getTrace (req, res, next) {
  tm.getTraceById(req.params.traceId, function (err, t) {
    if (err) {
      next(err);
    } else if (!t) {
      res.status(404).json({
        message: 'trace not found'
      });
    } else {
      res.json(t);
    }
  });
}


/**
 * Returns high-level info related to the specified application
 * @param  {IncomingRequest}   req
 * @param  {OutgoingResposne}  res
 * @param  {Function}          next
 */
function getApplicationInfo (req, res, next) {
  tm.isValidApplicationName(req.params.appId, function (err, valid) {
    if (err) {
      next(err);
    } else if (!valid) {
      res.status(404).json({
        message: 'invalid appId'
      });
    } else {
      async.parallel({
        traceCount: tm.getTraceCount.bind(tm, req.params.appId),
        uniqueUrls: tm.getUniqueUrls.bind(tm, req.params.appId),
        lastActive: tm.getTimeSinceLastTrace.bind(tm, req.params.appId),
      }, function (err, data) {
        if (err) {
          next(err);
        } else {
          // Return appId with response for simplicity
          data.appId = req.params.appId;

          res.json(data);
        }
      });
    }
  });
}

/**
 * Place traces contained in req.body into mongo
 * @param {IncomingRequest}   req
 * @param {OutgoingResposne}  res
 * @param {Function}          next
 */
function addTrace (req, res, next) {
  function onTraceInserted (err) {
    if (err) {
      next(err);
    } else {
      log.d('inserted trace with uuid %s successfully', req.body.uuid);
      res.json({
        message: 'ok'
      });
    }
  }

  var validationErrors = tm.verifyTrace(req.body).errors;

  if (validationErrors.length) {
    log.i(
      'invalid trace received from appId "%s", with "uuid"',
      req.body.appId,
      req.body.uuid
    );
    log.i('invalid trace json: \n%j', req.body);

    res.status(400).json({
      message: validationErrors
    });
  } else {
    log.d('inserting trace with uuid %s', req.body.uuid);
    tm.insertTrace(req.body, onTraceInserted);
  }
}


/**
 * Returns a list of any applications that have sent traces to this server
 * @param  {IncomingRequest}   req
 * @param  {OutgoingResposne}  res
 * @param  {Function} next
 */
function getApps (req, res, next) {
  log.d('getting application names');
  tm.getApplicationNames(function (err, list) {
    if (err) {
      next(err);
    } else {
      log.d('return application names');
      res.json(list);
    }
  });
}


/**
 * Returns the most recent traces for a given appId
 * @param  {IncomingRequest}   req
 * @param  {OutgoingResposne}  res
 * @param  {Function} next
 */
function getTracesForApplication (req, res, next) {
  log.d('getting traces for application "%s"', req.params.appId);
  tm.getTracesForApplication(req.params.appId, function (err, cursor) {
    if (err) {
      next(err);
    } else {
      log.d('returning traces for appId "%s"', req.params.appId);
      mongo.streamMongoCursorToHttpResponse(cursor, res);
    }
  });
}
