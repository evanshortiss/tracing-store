'use strict';

var _ = require('lodash')
  , env = require('get-env')
  , caseify = require('case')
  , Validator = require('jsonschema').Validator
  , traceSchema = require('lib/schema/trace')
  , mongo = require('mongo-utils')
  , defUrl = 'mongodb://127.0.0.1:27017/tracing';

if (env('OPENSHIFT_MONGODB_DB_HOST') && env('OPENSHIFT_MONGODB_DB_PORT')) {
  defUrl = 'mongodb://' +
    env('OPENSHIFT_MONGODB_DB_HOST') +
    ':' +
    env('OPENSHIFT_MONGODB_DB_PORT') + '/';
}

var mgr = mongo.getDatabaseManager({
  mongoUrl: env('TRACE_MONGO_URL', defUrl)
});


/**
 * Determines if the provided trace is valid
 * @param  {Object}  trace
 * @return {Object}
 */
exports.verifyTrace = function (trace) {
  return new Validator().validate(trace, traceSchema);
};


/**
 * Clones the input Object and returns it with header names
 * converted to camel case format
 * @param  {Object} data
 * @return {Object}
 */
function camelCaseHeaders (trace) {
  _.each(trace.headers, function (val, key) {
    trace.headers[caseify.camel(key)] = val;
    delete trace.headers[key];
  });

  return trace;
}


/**
 * Convert span dates to date objects so they're handled by Mongo as dates
 * @param  {Object} data
 * @return {Object}
 */
function formatSpanDates (trace) {
  // Convert timestamps to Date objects
  _.each(trace, function (s) {
    s.ts = new Date(s.ts);
  });

  return trace;
}


/**
 * Record the time traces are created at
 * @param  {Object} trace
 * @return {Object}
 */
function addCreateDatetime (trace) {
  // Add a creation date to trace entries
  trace.createTs = new Date();

  return trace;
}


/**
 * Find an event name within a trace
 * @param  {Object} trace
 * @param  {String} name
 * @return {Object}
 */
function getEventByName (trace, name) {
  var allEvents = _.flatten(trace.spans);

  return _.find(allEvents, function (evt) {
    return evt.name === name;
  });
}

/**
 * Calculate the duration of a trace if applicable/possible
 * @param  {Object} trace
 * @return {Object}
 */
function addTraceDuration (trace) {
  var s = getEventByName(trace, 'server-receive');
  var e = getEventByName(trace, 'server-send');

  if (s && e) {
    trace.duration = (e - s);
  }

  return trace;
}

// Generate public functions
mgr.generateInjectedFunctionsFromArray('traces', module.exports, [

  /**
   * Insert a trace into the collection.
   * Performs some pre-insert behaviour/formatting
   * @param  {Object}   collection
   * @param  {Object}   data
   * @param  {Function} callback
   */
  function insertTrace (collection, data, callback) {
    collection.insert(
      addTraceDuration(
        addCreateDatetime(
          camelCaseHeaders(
            formatSpanDates(_.clone(data))
          )
        )
      ),
      callback
    );
  },


  /**
   * Determines if the given appId exists on this server
   * @param  {Object}   collection
   * @param  {String}   appId
   * @param  {Function} callback
   */
  function isValidApplicationName (collection, appId, callback) {
    collection.findOne({
      appId: appId
    }, callback);
  },


  /**
   * Returns the total trace count for the given appId
   * @param  {Object}   collection
   * @param  {String}   appId
   * @param  {Function} callback
   */
  function getTraceCount (collection, appId, callback) {
    collection.find({
      appId: appId
    }).count(callback);
  },


  /**
   * Determines how many unique URL calls your application has received
   * @param  {Object}   collection
   * @param  {String}   appId
   * @param  {Function} callback
   */
  function getUniqueUrls (collection, appId, callback) {
    collection.distinct('url', function (err, list) {
      callback(err, (list) ? list.length : null);
    });
  },


  /**
   * Determines the time the last request was received at for a given appId
   * @param  {Object}   collection
   * @param  {String}   appId
   * @param  {Function} callback
   */
  function getTimeSinceLastTrace (collection, appId, callback) {
    collection.findOne({
      appId: appId
    }, {
      createTs: 1
    }, function (err, t) {
      if (err) {
        callback(err, null);
      } else {
        callback(null, t.createTs);
      }
    });
  },


  /**
   * Retrieve a trace by it's unique _id
   * @param  {Object}   collection
   * @param  {Object}   data
   * @param  {Function} callback
   */
  function getTraceById (collection, id, callback) {
    mgr.ensureObjectId(id, function (err, _id) {
      if (err) {
        callback(err, null);
      } else {
        collection.findOne({
          _id: _id
        }, callback);
      }
    });
  },


  /**
   * Get the 100 most recent traces for an application.
   * @param  {object}   collection
   * @param  {String}   appId
   * @param  {Function} callback
   */
  function getTracesForApplication (collection, appId, callback) {
    collection
      .find({
        appId: appId
      }, {
        limit: 100,
        sort: {
          createTs: 1
        }
      }, callback);
  },


  /**
   * Get a list of unique appId values.
   * @param  {Object}   collection
   * @param  {Function} callback
   */
  function getApplicationNames (collection, callback) {
    collection.distinct('appId', callback);
  },


  /**
   * Delete all data in the collection
   * @param {Function} callback
   */
  function purge (collection, callback) {
    collection.remove({}, callback);
  }
]);
