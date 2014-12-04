var request = require('superagent')
  , routes = require('../config/routes')
  , Promise = require('es6-promise').Promise
  , isValidToken = require('./jwt-token-expiry');

function CommandClient(config) {
  this.conf = config;
  this.routes = routes(config);
  this.token = null;
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
  this.getValidToken(this.token).then(function executeRequest(token) {
    request.post(this.routes.command)
      .accept('application/json')
      .send({
        'token' : token,
        'command' : commandObject
      }).end(callback);
    }.bind(this));
};

// Token methods
// ------------------------------------------------------------------
proto.getValidToken = function(existingToken) {
  return new Promise(this.tokenPromiseHandler.bind(this, existingToken));
};

proto.tokenPromiseHandler = function(existingToken, resolve, reject) {
  if (isValidToken(existingToken)) {
    resolve(existingToken);
  } else {
    this.requestToken(this.conf.user, this.conf.password, function(err, token) {
      if (err) {
        reject(err);
      } else {
        resolve(this.token);
      }
    });
  }
};

proto.requestToken = function(user, pass, callback) {
  request.post(this.routes.token)
    .send({
      'user' : user,
      'password' : pass
    })
    .end(function(err, result) {
      if (err) {
        callback(err);
      } else if (!isValidToken(result.body.token)) {
        if (result.serverError) {
          callback('Server error: '+ result.status );
        } else {
          callback('Server returned invalid JWT token');
        }
      } else {
        callback(null, result.body.token);
      }
    });
};

module.exports.client = CommandClient;
module.exports = function(config) {
  return new CommandClient(config);
};
