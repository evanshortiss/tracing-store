'use strict';

var express = require('express')
  , fhlog = require('fhlog')
  , env = require('get-env')
  , app = module.exports = express()
  , log = fhlog.get('')
  , path = require('path')
  , mbaasApi = require('fh-mbaas-api')
  , mbaasExpress = mbaasApi.mbaasExpress()
  , port = env('FH_PORT') || env('OPENSHIFT_NODEJS_PORT', 3001)
  , host = env('OPENSHIFT_NODEJS_IP', '0.0.0.0');

// Logging defaults to only write info level logs, can be overwritten by env var
fhlog.setDefault(
  'level',
  fhlog.LEVELS[
    env('TRACING_LOG_LEVEL', 'INF')
  ]
);

log.i('starting application');

// Bind routes to our application
require('lib/routes/trace')(app);
require('lib/routes/js')(app);

app.use('/sys', mbaasExpress.sys([]));
app.use('/mbaas', mbaasExpress.mbaas);

app.set('view engine', 'jade');
app.engine('jade', require('jade').__express);
app.get('/', function (req, res) {
  res.render('index', {
    env: env('FH_ENV', 'local')
  });
});

app.use(
  express.static(
    path.join(__dirname, './www')
  )
);

app.listen(port, host, function onExpressListening (err) {
  if (err) {
    throw err;
  }

  log.i('tracing-store started listening on %s:%s', host, port);
});
