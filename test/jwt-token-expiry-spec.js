var chai = require('chai')
  , sinon = require('sinon')
  , expect = chai.expect
  , isValidToken = require('../lib/jwt-token-expiry');

// exp 10
var validtoken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjEwfQ.YKUBhlD4led4tbMrhRVoYsjewYs6fFH669ozZVga14E';

// no exp claim
var invalidtoken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEyMzQ1Njc4OTB9.26PwiZPa_hFGAZIDd45zZSLk7-4CdnOGHfwQvuOIINI';

describe('isValidToken', function() {
  var clock;

  before(function() {
    clock = sinon.useFakeTimers();
  });

  after(function() {
    clock.restore();
  });

  it('rejects null', function() {
    expect(isValidToken(null)).to.be.false;
  });

  it('rejects undefined', function() {
    expect(isValidToken(undefined)).to.be.false;
  });

  it('rejects invalid JWT', function() {
    expect(isValidToken(invalidtoken)).to.be.false;
  });

  it('accepts valid exp claim', function() {
    expect(isValidToken(validtoken)).to.be.true;
  });

  it('rejects exp claim with less than ten seconds remaining', function() {
    clock.tick(10000);
    expect(isValidToken(validtoken)).to.be.false;
  });

});
