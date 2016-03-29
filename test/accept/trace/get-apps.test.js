'use strict';

var traces = require('lib/dao/trace')
  , expect = require('chai').expect
  , express = require('express')
  , supertest = require('supertest');

describe('GET /trace/apps', function () {
  var mod
    , app
    , data
    , request;

  beforeEach(function (done) {
    delete require.cache[require.resolve('data/sample-trace.json')];

    app = express();
    mod = require('lib/routes/trace')(app);
    data = require('data/sample-trace.json');
    request = supertest(app);

    // Need to start with a clean slate each time
    traces.purge(done);
  });

  it('should receive an empty array', function (done) {
    request
      .get('/trace/apps')
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
        .get('/trace/apps')
        .expect('content-type', /json/)
        .expect(200)
        .end(function (err, res) {
          expect(err).to.not.exit;
          expect(res.body).to.be.an('array');
          expect(res.body).to.have.length(1);
          expect(res.body[0]).to.equal(data.appId);
          done();
        });
    }

    traces.insertTrace(
      data,
      afterInsert
    );
  });

});
