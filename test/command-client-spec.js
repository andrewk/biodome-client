var chai = require('chai')
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
