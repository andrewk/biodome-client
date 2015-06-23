import request from 'superagent';
import { isValidToken } from './jwt';

export default class TokenClient {
  constructor(config) {
    this.user = config.user;
    this.password = config.password;
    this.routes = config.routes;
    this.token = config.token;
  }

  getValidToken() {
    return new Promise(this.tokenPromiseHandler.bind(this));
  }

  tokenPromiseHandler(resolve, reject) {
    if (isValidToken(this.token)) {
      resolve(this.token);
    } else {
      this.requestToken(this.user, this.password, (err, token) => {
        if (err) {
          reject(err);
        } else {
          this.token = token;
          resolve(this.token);
        }
      });
    }
  }

  requestToken(user, pass, callback) {
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
  }
}
