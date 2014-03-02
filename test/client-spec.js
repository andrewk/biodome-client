var chai = require('chai')
  , request = require('supertest')
  , WebSocket = require('ws')
  , expect = chai.expect
  , mockServer = require('./support/server')
  , clientFactory = require('../lib/client').factory
  , port = 9900;

describe('#constructor', function() {
  it('connects to the server', function(done) {
    var doTest = function(server) {
      var client = clientFactory({'host': 'localhost:'+port, 'ssl':false});
      client.connection.on('open', function() {
        expect(client.connection.readyState).to.equal(WebSocket.OPEN);
        client.close();
        server.close();
        done();
      });
    };

    mockServer(++port, {}, doTest);
  });
});

describe('event:open', function() {
  it('broadcasts an open event with itself as param', function(done) {
    var doTest = function(server) {
      var client = clientFactory({'host': 'localhost:'+port, 'ssl':false});
      client.on('open', function(passedClient) {
        expect(passedClient).to.deep.equal(client);
        client.close();
        server.close();
        done();
      });
    };
    mockServer(++port, {}, doTest);
  });
});

describe('event:close', function() {
  it('broadcasts a close event with itself as param', function(done) {
    var doTest = function(server) {
      var client = clientFactory({'host': 'localhost:'+port, 'ssl':false});
      client.on('open', function(cl) {
        cl.close();
      });

      client.on('close', function(passedClient) {
        expect(passedClient).to.deep.equal(client);
        server.close();
        done();
      });
    };
    mockServer(++port, {}, doTest);
  });
});

describe('#setDeviceState', function() {
  it('sends the correct message to the server', function(done) {
    var doTest = function(server) {
      var client = clientFactory({'host': 'localhost:'+port, 'ssl':false});

      client.on('open', function(cl) {
        cl.setDeviceState('lights', 'off');
      });

      client.on('close', function() {
        server.close();
        done();
      });
    };

    var listeners = {
      'connection' : function(clientConn) {
        clientConn.on('message', function(message) {
          expect(message).to.equal('device:lights:off');
          clientConn.close();
        });
      }
    };

    mockServer(++port, listeners, doTest);
  });

  it('emits message_error event when error data sent from server', function(done) {
    var doTest = function(server) {
      var client = clientFactory({'host': 'localhost:'+port, 'ssl':false});

      client.on('open', function(cl) {
        cl.setDeviceState('foo', 'off');
      });

      client.on('message_error', function(error) {
        expect(error).to.equal('unknown device id');
        client.close();
      });

      client.on('close', function() {
        server.close();
        done();
      });
    };

    var listeners = {
      'connection' : function(clientConn) {
        clientConn.send(JSON.stringify(
          { 'type' : 'error', 'message' : 'unknown device id' }
        ));
      }
    };

    mockServer(++port, listeners, doTest);
  });

  it('emits server_error on invalid message data', function(done) {
    var doTest = function(server) {
      var client = clientFactory({'host': 'localhost:'+port, 'ssl':false});
      client.messageValidator = { 
        parse : function() { 
          return { 'valid' : false, 'error' : 'blarg' } 
        }
      };

      client.on('open', function(cl) {
        cl.setDeviceState('foo', 'off');
      });

      client.on('server_error', function(error) {
        expect(error).to.equal('Server returned invalid response');
        client.close();
      });

      client.on('close', function() {

        server.close();
        done();
      });
    };

    var listeners = {
      'connection' : function(clientConn) {
        clientConn.send('This wont end well');
      }
    };

    mockServer(++port, listeners, doTest);
  });

});
