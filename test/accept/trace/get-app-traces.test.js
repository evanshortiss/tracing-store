'use strict';

var traces = require('lib/dao/trace')
  , expect = require('chai').expect
  , express = require('express')
  , supertest = require('supertest');

describe('GET /trace/apps/:appId', function () {
  var mod
    , app
    , request;

  beforeEach(function (done) {
    delete require.cache[require.resolve('data/sample-trace.json')];

    app = express();
    mod = require('lib/routes/trace')(app);
    request = supertest(app);

    // Need to start with a clean slate each time
    traces.purge(done);
  });

  it('should receive an empty array', function (done) {
    request
      .get('/trace/apps/my-amazing-express-app')
      .expect('content-type', /json/)
      .expect(200)
      .end(function (err, res) {
        expect(err).to.not.exit;
        expect(res.body).to.be.an('array');
        expect(res.body).to.have.length(0);
        done();
      });
  });

  it('should insert a trace into mongo', function (done) {
    var data = JSON.parse(
      require('fs').readFileSync('data/sample-trace.json', 'utf8')
    );

    function afterInsert (err) {
      expect(err).to.not.exist;

      request
        .get('/trace/apps/my-amazing-express-app')
        .expect('content-type', /json/)
        .expect(200)
        .end(function (err, res) {
          expect(err).to.not.exit;

          expect(res.body).to.be.an('array');
          expect(res.body).to.have.length(1);

          [
            'url',
            'method',
            '_id',
            'headers',
            'appId',
            'spans',
            'uuid',
            'createTs'
          ].forEach(function (key) {
            expect(res.body[0]).to.have.property(key);
          });

          expect(res.body[0].headers).to.have.property('cacheControl');
          expect(res.body[0].headers).to.have.property('userAgent');

          done();
        });
    }

    traces.insertTrace(
      data,
      afterInsert
    );
  });

});
