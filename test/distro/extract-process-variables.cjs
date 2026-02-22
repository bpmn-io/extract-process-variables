const {
  expect
} = require('chai');


describe('extract-process-variables - distribution', function() {

  it('should expose CJS bundle', function() {
    const { getProcessVariables, getScope } = require('@bpmn-io/extract-process-variables');

    expect(getProcessVariables).to.exist;
    expect(getScope).to.exist;
  });


  it('should expose zeebe CJS bundle', function() {
    const { getProcessVariables, getScope } = require('@bpmn-io/extract-process-variables/zeebe');

    expect(getProcessVariables).to.exist;
    expect(getScope).to.exist;
  });

});