var chai = require('chai')
  , expect = chai.expect
  , validator = require('../lib/message-validator').factory();

describe('#parse', function() {
  it('only object primitives are valid', function() {
    var types = [
      true,
      'ssstrinnngg!',
      12364
    ];
    
    for (var i in types) {
      expect(validator.parse(types[i]).valid).to.be.false;
    }
  }); 

  it('errors on missing type property', function() {
    var meta = validator.parse({ 'foo' : 'quz' });
    expect(meta.valid).to.be.false;
    expect(meta.error).to.equal('data must have a type property');
  });

  it('errors on invalid type', function() {
    var meta = validator.parse({ 'type' : 'squirrel' });
    expect(meta.valid).to.be.false;
    expect(meta.error).to.equal('invalid type property in response');
  });

});
