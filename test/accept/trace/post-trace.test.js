'use strict';

var expect = require('chai').expect
  , express = require('express')
  , supertest = require('supertest');

describe('POST /trace', function () {
  var mod
    , app
    , data
    , request;

  beforeEach(function () {
    delete require.cache[require.resolve('data/sample-trace.json')];

    app = express();
    mod = require('lib/routes/trace')(app);
    data = require('data/sample-trace.json');
    request = supertest(app);
  });

  it('should fail to insert a trace', function (done) {
    request
      .post('/trace')
      .send({})
      .expect('content-type', /json/)
      .expect(400)
      .end(done);
  });

  it('should insert a trace into mongo', function (done) {
    request
      .post('/trace')
      .send(data)
      .expect('content-type', /json/)
      .expect(200)
      .end(done);
  });

});
