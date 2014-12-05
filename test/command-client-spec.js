var chai = require('chai')
  , request = require('supertest')
  , sinon = require('sinon')
  , sinonChai = require('sinon-chai')
  , sinonAsPromised = require('sinon-as-promised')
  , chaiAsPromised = require('chai-as-promised')
  , expect = chai.expect
  , routes = require('../config/routes')('http://localhost:9022')
  , commandClient = require('../lib/command-client')
  , tokenClient = require('../lib/token-client')
  , tokens = require('./support/tokens')
  , app = require('./support/http-server')
  ;

chai.use(sinonChai);
chai.use(chaiAsPromised);

var tokenClientConf = {
  'user': 'john',
  'password': '1234',
  'routes': routes
};

var config = {
  'routes' : routes,
  'tokenClient' : tokenClient(tokenClientConf)
};

app.listen(9022);

// Issuing commands
// -----------------------------------------------------------
describe('CommandClient command functionality', function() {
  var clock, client;

  before(function() {
    client = commandClient(config);
    clock = sinon.useFakeTimers();
  });

  after(function() {
    client = null;
    clock.restore();
  });

  describe('#read', function() {
    it('accepts a string as selector and assumes it is the ID', function() {
      var spy = sinon.spy();
      client.command = spy;

      client.read('foo');
      expect(spy).to.have.been.calledWith({
        'selector' : { 'id' : 'foo' },
        'instruction' : { 'type' : 'read' }
      });
    });

    it('accepts an object selector', function() {
      var spy = sinon.spy();
      client.command = spy;

      client.read({ 'type' : 'foo'});
      expect(spy).to.have.been.calledWith({
        'selector' : { 'type' : 'foo' },
        'instruction' : { 'type' : 'read' }
      });
    });
  });

  describe('#write', function() {
    it('accepts a string as selector and assumes it is the ID', function() {
      var spy = sinon.spy();
      client.command = spy;

      client.write('foo', 'qux');
      expect(spy).to.have.been.calledWith({
        'selector' : { 'id' : 'foo' },
        'instruction' : { 'type' : 'write', 'value' : 'qux' }
      });
    });

    it('accepts an object selector', function() {
      var spy = sinon.spy();
      client.command = spy;

      client.write({ 'type' : 'foo' }, 'qux');
      expect(spy).to.have.been.calledWith({
        'selector' : { 'type' : 'foo' },
        'instruction' : { 'type' : 'write', 'value' : 'qux' }
      });
    });
  });

  describe('#commandRequest', function() {
    it('ensures it has a server token by calling getValidToken', function() {
      var stub = sinon.stub();
      stub.resolves(tokens.valid);
      client.tokenClient.getValidToken = stub;

      client.commandRequest({'foo' : 'bar'}, function() {});
      expect(stub).to.have.been.called;
    });

    it('results in a request to the command API route', function(done) {
      client.tokenClient.token = tokens.valid;
      client.commandRequest({
        'selector' : {'id' : 'foo'},
        'instruction' : {'type' : 'read' }
      }, function(err, res) {
        if (err) {
          done(err);
        } else {
          expect(res.body.foo).to.equal('bar');
          done();
        }
      });
    });
  });
});
