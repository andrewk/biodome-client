var request = require('superagent')
  , routes = require('../config/routes')
  , Promise = require('es6-promise').Promise;

function CommandClient(config) {
  this.conf = config;
  this.routes = routes(config);
  this.token = null;
}

var proto = CommandClient.prototype;
var jwtToken = null;

// Issue a command to the server
// callback receives (err, jsonResult)
proto.command = function(selector, value, callback) {
  return new Promise(function(resolve, reject) {
    this.getToken(jwtToken).then(function(token) {
      jwtToken = token;
      this.commandRequest(token, selector, value, function(err, result) {
        if (err) {
          reject(err);
        } else {
          resolve(result.body);
        }
      });
     });
  }.bind(this));
};

//
proto.commandRequest = function(token, selector, value, callback) {
  request(this.routes.command)
    .set('Accept', 'application/json')
    .set('jwt', token)
    .send({
      'selector' : selector,
      'command' : { 'type' : 'write', 'value' : value}
    }).end(callback);
};

proto.tokenRequest = function(user, pass, callback) {
   request(this.routes.token)
    .send({
      'user' : user,
      'password' : pass
    }).end(callback);
};

proto.getValidToken = function(existingToken) {
  return new Promise(function(resolve, reject) {
    if (this.validToken(existingToken)) {
      resolve(existingToken);
    } else {
      this.tokenRequest(this.conf.user, this.conf.password, function(err, result) {
        if (err) {
          reject(err);
        } else if (!validToken(result.body.token)) {
          reject('Server returned invalid JWT token');
        } else {
          this.token = result.body.token;
          resolve(this.token);
        }
      });
    }
  }.bind(this));
};

proto.validToken = function(token) {
  var claims;

  if (!token) {
    return false;
  }

  claims = token.split('.')[1];

  if (claims === undefined) {
    return false;
  }

  try {
    claims = JSON.parse(
      new Buffer(claims + '==', 'base64').toString('ascii')
    );
  } catch (e) {
    return false;
  }

  if (claims.exp === undefined || Math.floor(Date.now() / 1000) + 10 > claims.exp )  {
    return false;
  }

  return true;
}

module.exports.client = CommandClient;
module.exports = function(config) {
  return new CommandClient(config);
};
