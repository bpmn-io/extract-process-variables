import { expect } from 'chai';

import extractVariables from '../../../../src/zeebe/extractors/extractInputElement.js';

import { selfAndAllFlowElements } from '../../../../src/shared/util/ElementsUtil.js';
import { convertToTestable, getRootElement, readModel } from '../../TestHelper.js';


describe('zeebe/extractors - input element', function() {

  it('should extract variables from input elements', async function() {

    // given
    const model = await readModel('test/zeebe/fixtures/sub-process.multi-instance.bpmn');

    const rootElement = getRootElement(model);

    const elements = selfAndAllFlowElements([ rootElement ], false);

    // when
    const variables = extractVariables({
      elements,
      containerElement: rootElement,
      processVariables: []
    });

    // then
    expect(convertToTestable(variables)).to.eql([
      { name: 'inputElement', origin: [ 'SubProcess_1' ], scope: 'SubProcess_1' },
    ]);
  });


  it('should not extract variables from empty loopCharacteristics', async function() {

    // given
    const model = await readModel('test/zeebe/fixtures/sub-process.multi-instance-empty.bpmn');

    const rootElement = getRootElement(model);

    const elements = selfAndAllFlowElements([ rootElement ], false);

    // when
    const variables = extractVariables({
      elements,
      containerElement: rootElement,
      processVariables: []
    });

    // then
    expect(convertToTestable(variables)).to.eql([]);
  });

});
