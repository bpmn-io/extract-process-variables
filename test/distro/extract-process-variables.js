const {
  expect
} = require('chai');


describe('exctract-process-variables', function() {

  it('should expose CJS bundle', function() {
    const extractProcessVariables = require('../../dist');

    expect(extractProcessVariables.getProcessVariables).to.exist;
  });
});