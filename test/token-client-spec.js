var chai = require('chai')
  , request = require('supertest')
  , sinon = require('sinon')
  , sinonChai = require('sinon-chai')
  , sinonAsPromised = require('sinon-as-promised')
  , chaiAsPromised = require('chai-as-promised')
  , expect = chai.expect
  , routes = require('../config/routes')
  , tokenClient = require('../lib/token-client')
  , tokens = require('./support/tokens')
  , app = require('./support/http-server')
  ;

chai.use(sinonChai);
chai.use(chaiAsPromised);

var config = {
  'user' : 'TIMMEH',
  'password' : 'password123',
  'routes' : routes('http://localhost:9022')
};

app.listen(9022);

describe('TokenClient', function() {
  var clock, client;

  before(function() {
    client = tokenClient(config);
    clock = sinon.useFakeTimers();
  });

  after(function() {
    client = null;
    clock.restore();
  });

  describe('#construct', function() {
    it('sets config', function() {
      expect(client.conf).to.equal(config)
    });

    it('sets routes', function() {
      expect(client.routes).to.equal(config.routes);
    });
  });

  describe('#requestToken', function() {
    it('returns valid token from the server', function(done) {
      client.routes.token = 'http://localhost:9022/valid-token';
      client.requestToken(config.user, config.pass, function(err, result) {
        if (err) done(err);

        expect(result).to.equal(tokens.valid);
        done();
      });
    });

    it('errors if server returns and invalid token', function(done) {
      client.routes.token = 'http://localhost:9022/invalid-token';
      client.requestToken(config.user, config.pass, function(err, result) {
        expect(err).to.equal('Server returned invalid JWT token');
        done();
      });
    });

    it('errors if server fails', function(done) {
      client.routes.token = 'http://localhost:9022/fail-500';
      client.requestToken(config.user, config.pass, function(err, result) {
        expect(err).to.equal('Server error: 500');
        done();
      });
    });
  });

  describe('#getValidToken', function() {
    it('resolves immediately when given a valid token', function() {
      client.token = tokens.valid;
      return expect(client.getValidToken()).to.become(tokens.valid);
    });

    it('calls #requestToken when given an invalid token', function() {
      var spy = sinon.spy();
      client.requestToken = spy;

      client.token = tokens.invalid;
      client.getValidToken();
      expect(spy).to.have.been.calledOnce;
    });
  });

  describe('#tokenPromiseHandler', function() {
    var resolve, reject;

    before(function() {
      resolve = sinon.spy();
      reject = sinon.spy();
    });

    it('resolves immediately when given a valid token', function() {
      client.token = tokens.valid;
      client.tokenPromiseHandler(resolve, reject);
      expect(resolve).to.have.been.calledWith(tokens.valid);
    });

    it('calls #requestToken if existing token is invalid', function() {
      client.token = tokens.invalid;
      var requestSpy = sinon.spy();
      client.requestToken = requestSpy;
      client.tokenPromiseHandler(resolve, reject);
      expect(requestSpy).to.have.been.calledOnce;
    });

    it('rejects if requestToken fails', function() {
      // stub out requestToken
      client.requestToken = function(u, p, cb) {
        cb('bad things');
      };

      client.token = tokens.invalid;
      client.tokenPromiseHandler(resolve, reject);
      expect(reject).to.have.been.calledWith('bad things');
    });

    it('returns a valid token after successful call to tokenRequest', function() {
      // stub out requestToken
      client.requestToken = function(u, p, cb) {
        cb(null, tokens.valid);
      };
      
      client.token = tokens.invalid;
      client.tokenPromiseHandler(resolve, reject);
      expect(resolve).to.have.been.calledWith(tokens.valid);
    });
  });
});