const {
  expect
} = require('chai');

const pkg = require('../../package.json');


describe('exctract-process-variables', function() {

  it('should expose CJS bundle', function() {
    const extractProcessVariables = require('../../' + pkg['main']);

    expect(extractProcessVariables.getProcessVariables).to.exist;
  });


  it('should expose zeebe CJS bundle', function() {
    const extractProcessVariables = require('../../zeebe');

    expect(extractProcessVariables.getProcessVariables).to.exist;
  });

});