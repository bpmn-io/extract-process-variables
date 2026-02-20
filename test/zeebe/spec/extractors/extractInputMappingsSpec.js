import { expect } from 'chai';

import extractVariables from '../../../../src/zeebe/extractors/extractInputMappings.js';

import { selfAndAllFlowElements } from '../../../../src/shared/util/ElementsUtil.js';
import { convertToTestable, getRootElement, readModel } from '../../TestHelper.js';


describe('zeebe/extractors - input mappings', function() {

  it('should extract variables from in mappings', async function() {

    // given
    const model = await readModel('test/zeebe/fixtures/sub-process.input-mapping.bpmn');

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
      { name: 'variable1', origin: [ 'SubProcess_1' ], scope: 'SubProcess_1' },
      { name: 'variable2', origin: [ 'SubProcess_1' ], scope: 'SubProcess_1' },
    ]);
  });

});