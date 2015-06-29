import chai from 'chai';
import WebSocket from 'ws';
import sinon from 'sinon';
import { EventEmitter } from 'events';
import mockServer from './support/server';
import Client from '../index';

let port = 9900;
const expect = chai.expect;

describe('Client', function() {
  describe('connect', function() {
    it('connects to the socket server', function(done) {
      const doTest = function(server) {
        const client = new Client({
          host: 'localhost:'+port,
          isSecureConnection: false,
          events: new EventEmitter
        });

        client.events.on('connection.open', function() {
          expect(client.connection.readyState).to.equal(WebSocket.OPEN);
          client.close();
          server.close();
          done();
        });
      };

      mockServer(++port, {}, doTest);
    });
  });

  describe('events', function() {
    it('broadcasts a close event with itself as param', function(done) {
      const doTest = function(server) {
        const client = new Client({
          host: 'localhost:'+port,
          isSecureConnection: false,
          events: new EventEmitter
        });

        client.events.on('connection.open', function(cl) {
          cl.close();
        });

        client.events.on('connection.close', function(passedClient) {
          expect(passedClient).to.deep.equal(client);
          server.close();
          done();
        });
      };
      mockServer(++port, {}, doTest);
    });
  });

  describe('receiving server data', function() {
    it('parses JSON received from the server and broadcasts a data event', function(done) {
      const doTest = function(server) {
        const client = new Client({
          host: 'localhost:'+port,
          isSecureConnection: false,
          events: new EventEmitter
        });

        client.events.on('connection.open', function() {
          server.socketServer.clients[0].send(JSON.stringify({
            'type': 'data',
            'data': {
              'foo': 'bar'
            }
          }));

          server.socketServer.clients[0].send(JSON.stringify({
            'type': 'command',
            'data': {
              'foo': 'bar'
            }
          }));
        });

        client.events.on('data', function(data) {
          expect(JSON.stringify(data)).to.equal(JSON.stringify({"foo":"bar"}));
          client.close();
        });

        client.events.on('command', function(data) {
          expect(JSON.stringify(data)).to.equal(JSON.stringify({"foo":"bar"}));
          client.close();
        });

        client.events.on('connection.close', function() {
          server.close();
          done();
        });
      };

      mockServer(++port, {}, doTest);
    });
  });

});
