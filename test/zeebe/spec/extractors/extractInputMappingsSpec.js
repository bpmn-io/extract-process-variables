import { expect } from 'chai';

import extractVariables from '../../../../src/zeebe/extractors/extractInputMappings.js';

import { selfAndAllFlowElements } from '../../../../src/shared/util/ElementsUtil.js';
import { convertToTestable, getRootElement, readModel } from '../../TestHelper.js';


describe('zeebe/extractors - input mappings', function() {

  it('should extract variables for sub-process', async function() {

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


  it('should extract variables for task', async function() {

    // given
    const model = await readModel('test/zeebe/fixtures/script-task-result-variable-local.bpmn');

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
      { name: 'foo', origin: [ 'Task_1' ], scope: 'Task_1' }
    ]);
  });

});