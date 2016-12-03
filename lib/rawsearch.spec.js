var expect = require('chai').expect;

var rawsearch = require('./rawsearch');

describe('Raw Search', function () {
  it('Reject empty query', function () {
    expect(rawsearch.search()).to.be.equal(-1);
  })
})