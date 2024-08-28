import chai from 'chai';

const expect = chai.expect;


describe('exctract-process-variables', function() {

  it('should expose ESM bundle', async function() {

    // when
    const imported = await import('@bpmn-io/extract-process-variables');

    // then
    expect(imported).to.exist;
  });


  it('should expose zeebe ESM bundle', async function() {

    // when
    const imported = await import('@bpmn-io/extract-process-variables/zeebe');

    // then
    expect(imported).to.exist;
  });

});