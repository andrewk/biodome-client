var chai = require('chai')
  , util = require('util')
  , request = require('supertest')
  , WebSocket = require('ws')
  , expect = chai.expect
  , mockServer = require('./support/server')
  , SocketClient = require('../lib/socket-client')
  , port = 9900;

describe('#constructor', function() {
  it('connects to the server', function(done) {
    var doTest = function(server) {
      var client = new SocketClient({'host': 'localhost:'+port, 'ssl':false});
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
      var client =  new SocketClient({'host': 'localhost:'+port, 'ssl':false});
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
      var client = new SocketClient({'host': 'localhost:'+port, 'ssl':false});
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

describe('event:data', function() {
  it('parses JSON received from the server and broadcasts a data event', function(done) {
    var doTest = function(server) {
      var client = new SocketClient({'host': 'localhost:'+port, 'ssl':false});

      client.on('open', function() {
        server.socketServer.clients[0].send(JSON.stringify({"foo":"bar"}));
      });

      client.on('data', function(data) {
        expect(JSON.stringify(data)).to.equal(JSON.stringify({"foo":"bar"}));
        client.close();
      });

      client.on('close', function() {
        server.close();
        done();
      });
    };

    mockServer(++port, {}, doTest);
  });
});
