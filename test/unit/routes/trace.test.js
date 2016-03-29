'use strict';

var fs = require('fs')
  , expect = require('chai').expect
  , sinon = require('sinon')
  , express = require('express')
  , supertest = require('supertest')
  , proxyquire = require('proxyquire');

describe('/trace', function () {
  var mod
    , app
    , data
    , insertStub
    , getTracesStub
    , getNamesStub
    , request;

  beforeEach(function () {
    app = express();

    data = JSON.parse(
      fs.readFileSync('data/sample-trace.json', 'utf8')
    );

    insertStub = sinon.stub();
    getTracesStub = sinon.stub();
    getNamesStub = sinon.stub();

    mod = proxyquire('lib/routes/trace', {
      'lib/dao/trace': {
        insertTrace: insertStub,
        getTracesForApplication: getTracesStub,
        getApplicationNames: getNamesStub
      }
    })(app);

    request = supertest(app);
  });

  describe('POST /', function () {

    it('should return 200', function (done) {
      insertStub.callsArgWith(1, null);

      request
        .post('/trace')
        .expect(200)
        .expect('content-type', /json/)
        .send(data)
        .end(function (err, res) {
          expect(err).to.be.null;
          expect(res).to.be.an('object');
          expect(res.body.message).to.equal('ok');
          done();
        });
    });

    it('should return 400', function (done) {
      request
        .post('/trace')
        .expect(400)
        .expect('content-type', /json/)
        .send({})
        .end(function (err, res) {
          expect(err).to.be.null;
          expect(res.body.message).to.be.an('array');
          done();
        });
    });

    it('should return 500', function (done) {
      insertStub.callsArgWith(1, new Error('oh noes!'), null);

      request
        .post('/trace')
        .expect(500)
        .expect('content-type', /json/)
        .send(data)
        .end(function (err, res) {
          expect(res.body.message).to.equal('internal server error');
          done();
        });
    });

  });

  describe('GET /apps', function () {
    it('should return a 500', function (done) {
      getNamesStub.callsArgWith(0, new Error('oh noes!'), null);

      request
        .get('/trace/apps')
        .expect(500)
        .expect('content-type', /json/)
        .end(function (err, res) {
          expect(res.body.message).to.equal('internal server error');
          done();
        });
    });
  });


  describe('GET /apps/:appId', function () {
    it('should return a 500', function (done) {
      getTracesStub.callsArgWith(1, new Error('oh noes!'), null);

      request
        .get('/trace/apps/nope')
        .expect(500)
        .expect('content-type', /json/)
        .end(function (err, res) {
          expect(res.body.message).to.equal('internal server error');
          done();
        });
    });
  });

});
