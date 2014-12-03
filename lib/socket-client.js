var ws = require('ws')
  , util = require('util')
  , EventEmitter = require('events').EventEmitter;

function SocketClient(conf) {
  // { host : str, ssl : bool }
  this.conf = conf;
  EventEmitter.call(this);
  var protocol = (this.conf.ssl) ? 'wss://' : 'ws://';
  // TODO reconnection strategy
  this.connection = new ws(protocol + this.conf.host);
  this.wireEvents();
}

util.inherits(SocketClient, EventEmitter);

var proto = SocketClient.prototype;

proto.wireEvents = function() {
  var self = this;
  this.connection.on('open', this.socketOpen.bind(this));
  this.connection.on('close', this.socketClose.bind(this));
  this.connection.on('message', function(message) {
    self.socketMessage(message);
  });

  this.connection.on('error', function(error) {
    self.socketError(error);
  });
};

proto.socketOpen = function() {
  this.emit('open', this);
};

proto.socketClose = function() {
  this.emit('close', this);
};

proto.socketMessage = function(msg) {
  try {
    var data = JSON.parse(msg);
  } catch(error) {
    return this.socketError('Server returned invalid response');
  }

  this.emit('data', data);
};

proto.socketError = function(error) {
  this.emit('server_error', error);;
};

proto.close = function() {
  this.connection.close();
};

module.exports = SocketClient;
module.exports.new = function(conf) {
  return new SocketClient(conf);
}
