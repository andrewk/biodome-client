var request = require('superagent')
  , Promise = require('es6-promise').Promise
  , isValidToken = require('./jwt-token-expiry');

function TokenClient(config) {
  this.user = config.user;
  this.password = config.password;
  this.routes = config.routes;
  this.token = config.token;
}

var proto = TokenClient.prototype;

proto.getValidToken = function() {
  return new Promise(this.tokenPromiseHandler.bind(this));
};

proto.tokenPromiseHandler = function(resolve, reject) {
  if (isValidToken(this.token)) {
    resolve(this.token);
  } else {
    this.requestToken(this.user, this.password, function(err, token) {
      if (err) {
        reject(err);
      } else {
        this.token = token;
        resolve(this.token);
      }
    }.bind(this));
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

module.exports.client = TokenClient;
module.exports = function(config) {
  return new TokenClient(config);
};
