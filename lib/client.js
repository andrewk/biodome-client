var ws = require('ws')
  , util = require('util')
  , EventEmitter = require('events').EventEmitter
  , log = require('./log');

function Client(conf)
{
  // { host : str, ssl : bool }
  this.conf = conf;
  EventEmitter.call(this);
  var protocol = (this.conf.ssl) ? 'wss://' : 'ws://';
  this.connection = new ws(protocol + this.conf.host);
  this.wireEvents();
}

util.inherits(Client, EventEmitter);

var proto = Client.prototype;

proto.wireEvents = function()
{
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

proto.socketError = function(error) {
  this.error = error;
  this.emit('close', this);
};

proto.setDeviceState = function(deviceId, state)
{
  this.connection.send('device:' + deviceId + ':' + state);
};

proto.close = function()
{
  this.connection.close();
}

module.exports = Client;
module.exports.factory = function(conf) {
  return new Client(conf);
}
