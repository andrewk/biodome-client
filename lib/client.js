var ws = require('ws')
  , util = require('util')
  , EventEmitter = require('events').EventEmitter
  , log = require('./log')
  , ServerDataValidator = require('./server-data-validator');

function Client(conf)
{
  // { host : str, ssl : bool }
  this.conf = conf;
  EventEmitter.call(this);
  var protocol = (this.conf.ssl) ? 'wss://' : 'ws://';
  // TODO reconnection strategy
  this.connection = new ws(protocol + this.conf.host);
  this.responseValidator = new ServerDataValidator;
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

proto.socketMessage = function(msg) {
  try {
    var data = JSON.parse(msg);
  } catch(error) {
    return this.socketError('Server returned invalid response');
  }


  if (this.responseValidator.isValid(data)) {
    if ('error' == data.type) {
      return this.messageError( data.message);
    }
    this.emit(data.type + ':update', data);
  } else {
    return this.socketError('Server returned invalid response');
  }
};

proto.messageError = function(error) {
  //log('error', 'message error: ' + error);
  this.emit('message_error', error);
};

proto.socketError = function(error) {
  //log('error', error);
  this.emit('server_error', error);;
};

proto.setDeviceState = function(deviceId, state)
{
  this.connection.send('device:' + deviceId + ':' + state);
};

proto.close = function()
{
  this.connection.close();
};

module.exports = Client;
module.exports.factory = function(conf) {
  return new Client(conf);
}
