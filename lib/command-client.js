var request = require('superagent')
  , routes = require('../config/routes')
  , Promise = require('es6-promise').Promise
  , isValidToken = require('./jwt-token-expiry');

function CommandClient(config) {
  this.conf = config;
  this.routes = config.routes;
  this.tokenClient = config.tokenClient;
}

var proto = CommandClient.prototype;

proto.read = function(selector) {
  if (typeof selector === 'string') {
    selector = { 'id' : selector };
  }

  return this.command({
    'selector' : selector,
    'instruction' : { 'type' : 'read' }
  });
};

proto.write = function(selector, value) {
  if (typeof selector === 'string') {
    selector = { 'id' : selector };
  }

  return this.command({
    'selector' : selector,
    'instruction' : { 'type' : 'write', 'value' : value }
  });
};

// Issue a command to the server
proto.command = function(commandObject) {
  return new Promise(function(resolve, reject) {
    this.commandRequest(commandObject, function(err, res) {
      if (err) {
        reject(err);
      } else {
        resolve(res.body);
      }
    });
  }.bind(this));
};

proto.commandRequest = function(commandObject, callback) {
  this.tokenClient.getValidToken().then(function executeRequest(token) {
    request.post(this.routes.command)
      .accept('application/json')
      .send({
        'token' : token,
        'command' : commandObject
      }).end(callback);
    }.bind(this));
};

module.exports.client = CommandClient;
module.exports = function(config) {
  return new CommandClient(config);
};
