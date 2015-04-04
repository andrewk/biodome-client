import chai from 'chai';
import WebSocket from 'ws';
import mockServer from './support/server';
import SocketClient from '../lib/SocketClient';

let port = 9900;
const expect = chai.expect;

describe('#constructor', function() {
  it('connects to the server', function(done) {
    const doTest = function(server) {
      const client = new SocketClient({'host': 'localhost:'+port, 'ssl':false});
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
    const doTest = function(server) {
      const client =  new SocketClient({'host': 'localhost:'+port, 'ssl':false});
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
    const doTest = function(server) {
      const client = new SocketClient({'host': 'localhost:'+port, 'ssl':false});
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
    const doTest = function(server) {
      const client = new SocketClient({'host': 'localhost:'+port, 'isSSL':false});

      client.on('open', function() {
        server.socketServer.clients[0].send(JSON.stringify({
          'type': 'data',
          'data': {
            'foo': 'bar'
          }
        }));
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
