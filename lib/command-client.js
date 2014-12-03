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
var jwtToken = null;

// Issue a command to the server
proto.command = function(selector, value) {
  return new Promise(this.commandPromiseHandler.bind(this, selector, value));
};

proto.commandPromiseHandler = function(selector, value, resolve, reject) {
  this.getToken(jwtToken).then(function(token) {
    jwtToken = token;
    this.commandRequest(token, selector, value, function(err, result) {
      if (err) {
        reject(err);
      } else {
        resolve(result.body.token);
      }
    });
   });
};

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

// Server requests
// ------------------------------------------------------------------

proto.commandRequest = function(token, selector, value, callback) {
  request.post(this.routes.command)
    .accept('application/json')
    .data({
      'jwt' : token,
      'selector' : selector,
      'command' : { 'type' : 'write', 'value' : value}
    }).end(callback);
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
