import chai from 'chai';
import sinon from 'sinon';
import { isValidToken } from '../lib/jwt';
import tokens from './support/tokens';

const expect = chai.expect;

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
    expect(isValidToken(tokens.invalid)).to.be.false;
  });

  it('accepts valid exp claim', function() {
    expect(isValidToken(tokens.valid)).to.be.true;
  });

  it('rejects exp claim with less than ten seconds remaining', function() {
    clock.tick(10000);
    expect(isValidToken(tokens.valid)).to.be.false;
  });

});
