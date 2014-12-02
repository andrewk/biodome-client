var chai = require('chai')
  , request = require('supertest')
  , sinon = require('sinon')
  , sinonChai = require('sinon-chai')
  , chaiAsPromised = require('chai-as-promised')
  , expect = chai.expect
  , commandClient = require('../lib/command-client')
  , tokens = require('./tokens')
  , app = require('./server')
  ;

chai.use(sinonChai);
chai.use(chaiAsPromised);

var config = {
  'host' : 'http://localhost:9022',
  'user' : 'TIMMEH',
  'password' : 'password123'
};

app.listen(9022);

describe('CommandClient', function() {
  var clock, client;

  before(function() {
    client = commandClient(config);
    clock = sinon.useFakeTimers();
  });

  after(function() {
    client = null;
    clock.restore();
  });

  describe('#construct', function() {

    it('sets config', function() {
      expect(client.conf.host).to.equal('http://localhost:9022')
    });

    it('builds routes', function() {
      expect(client.hasOwnProperty('routes')).to.be.ok;
      expect(typeof client.routes).to.equal('object');
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
      return expect(client.getValidToken(tokens.valid)).to.become(tokens.valid);
    });

    it('calls #requestToken when given an invalid token', function() {
      var spy = sinon.spy();
      client.requestToken = spy;

      client.getValidToken(tokens.invalid);
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
      client.tokenPromiseHandler(tokens.valid, resolve, reject);
      expect(resolve).to.have.been.calledWith(tokens.valid);
    });

    it('calls #requestToken if existing token is invalid', function() {
      var requestSpy = sinon.spy();
      client.requestToken = requestSpy;
      client.tokenPromiseHandler(tokens.invalid, resolve, reject);
      expect(requestSpy).to.have.been.calledOnce;
    });

    it('rejects if requestToken fails', function() {
      // stub out requestToken
      client.requestToken = function(u, p, cb) {
        cb('bad things');
      };

      client.tokenPromiseHandler(tokens.invalid, resolve, reject);
      expect(reject).to.have.been.calledWith('bad things');
    });

    it('returns a valid token after successful call to tokenRequest', function() {
      // stub out requestToken
      client.requestToken = function(u, p, cb) {
        cb(null, tokens.valid);
      };  

      client.tokenPromiseHandler(tokens.invalid, resolve, reject);
      expect(resolve).to.have.been.calledWith(tokens.valid);
    });
  });
});
