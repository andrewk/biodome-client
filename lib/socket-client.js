var ws = require('ws')
  , util = require('util')
  , EventEmitter = require('eventemitter3');

class SocketClient {
  constructor({ host, isSSL, eventBus }) {
    this.events = eventBus || new EventEmitter();
    var protocol = (isSSL) ? 'wss://' : 'ws://';

    // FIXME: needs reconnection strategy
    this.connection = new ws(protocol + host);
    this.connection.on('open', () => this.events.emit('open', this));
    this.connection.on('close', () => this.events.emit('close', this));
    this.connection.on('message', this.emitMessage.bind(this));
    this.connection.on('error', this.socketError.bind(this));
  }

  on(event, listener) {
    return this.events.on(event, listener)
  }

  emitMessage(msg) {
    try {
      msg = JSON.parse(msg);
    } catch(error) {
      return this.socketError('Server returned invalid response');
    }

    if (msg.type === 'error') {
      this.events.emit('error', msg.data);
    } else if (msg.type === 'data') {
      this.events.emit('data', msg.data);
    }
  }

  socketError(error) {
    this.events.emit('server_error', error);
  }

  close() {
    this.connection.close();
  }
}

module.exports = SocketClient;
module.exports.new = function(conf) {
  return new SocketClient(conf);
}
