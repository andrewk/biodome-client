var util = require('util')
  , validTypes = ['device', 'sensor', 'error']

function Validator() {
  this.parse = function(input) {
    if (!util.isObject(input)) {
      return this.error('data must be an object');
    }

    if (!input.type) {
      return this.error('data must have a type property');
    }

    if (validTypes.indexOf(input.type) == -1) {
      return this.error('invalid type property in response');
    }

    return { 'valid' : true };
  };

  this.error = function(message) {
    return {
      'valid' : false,
      'error' : message
    };
  };
};

module.exports = Validator;
module.exports.factory = function() {
  return new Validator();
};

