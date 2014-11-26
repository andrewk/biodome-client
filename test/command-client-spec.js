var chai = require('chai')
  , sinon = require('sinon')
  , util = require('util')
  , request = require('supertest')
  , expect = chai.expect
  , commandClient = require('../lib/command-client')
  , client;

// exp 10
var validtoken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjEwfQ.YKUBhlD4led4tbMrhRVoYsjewYs6fFH669ozZVga14E';

// no exp claim
var invalidtoken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEyMzQ1Njc4OTB9.26PwiZPa_hFGAZIDd45zZSLk7-4CdnOGHfwQvuOIINI';

describe('#construct', function() {
  before(function() {
    client = commandClient({'host' : 'foo.com'});
  });

  it('sets config', function() {
    expect(client.conf.host).to.equal('foo.com')
  });

  it('builds routes', function() {
    expect(client.hasOwnProperty('routes')).to.be.ok;
    expect(typeof client.routes).to.equal('object');
  });
});

describe('validToken', function() {
  var clock;

  before(function() {
    client = commandClient({'host' : 'foo.com'});
    clock = sinon.useFakeTimers();
  });

  after(function() {
    clock.restore();
  });

  it('rejects null', function() {
    expect(client.validToken(null)).to.be.false;
  });

  it('rejects undefined', function() {
    expect(client.validToken(undefined)).to.be.false;
  });

  it('rejects invalid JWT', function() {
    expect(client.validToken(invalidtoken)).to.be.false;
  });

  it('accepts valid exp claim', function() {
    expect(client.validToken(validtoken)).to.be.true;
  });

  it('rejects exp claim with less than ten seconds remaining', function() {
    clock.tick(10000);
    expect(client.validToken(validtoken)).to.be.false;
  });

});
