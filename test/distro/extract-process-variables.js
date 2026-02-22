import { expect } from 'chai';


describe('extract-process-variables - distribution', function() {

  it('should expose ESM bundle', async function() {

    // when
    const { getProcessVariables, getScope } = await import('@bpmn-io/extract-process-variables');

    // then
    expect(getProcessVariables).to.exist;
    expect(getScope).to.exist;
  });


  it('should expose ESM bundle / zeebe', async function() {

    // when
    const { getProcessVariables, getScope } = await import('@bpmn-io/extract-process-variables/zeebe');

    // then
    expect(getProcessVariables).to.exist;
    expect(getScope).to.exist;
  });

});