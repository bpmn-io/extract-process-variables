const {
  expect
} = require('chai');


describe('extract-process-variables - distribution', function() {

  it('should expose CJS bundle', function() {
    const extractProcessVariables = require('@bpmn-io/extract-process-variables');

    expect(extractProcessVariables.getProcessVariables).to.exist;
  });


  it('should expose CJS bundle / zeebe', function() {
    const extractProcessVariables = require('@bpmn-io/extract-process-variables/zeebe');

    expect(extractProcessVariables.getProcessVariables).to.exist;
  });

});