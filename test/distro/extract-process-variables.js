const {
  expect
} = require('chai');


describe('exctract-process-variables', function() {

  it('should expose CJS bundle', function() {
    const extractProcessVariables = require('../../dist');

    expect(extractProcessVariables.getProcessVariables).to.exist;
  });


  it('should expose zeebe CJS bundle', function() {
    const extractProcessVariables = require('../../zeebe');

    expect(extractProcessVariables.getProcessVariables).to.exist;
  });

});