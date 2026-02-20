import { expect } from 'chai';

import extractVariables from '../../../../src/zeebe/extractors/extractResultVariables.js';

import { selfAndAllFlowElements } from '../../../../src/shared/util/ElementsUtil.js';
import { convertToTestable, getRootElement, readModel } from '../../TestHelper.js';


describe('zeebe/extractors - result variables', function() {

  it('should extract variables from called decision', async function() {

    // given
    const model = await readModel('test/zeebe/fixtures/business-rule-task-result-variable.bpmn');

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
      { name: 'resultVariable', origin: [ 'Task_1' ], scope: 'Process_1' }
    ]);
  });


  it('should extract variables from script', async function() {

    // given
    const model = await readModel('test/zeebe/fixtures/script-task-result-variable.bpmn');

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
      { name: 'resultVariable', origin: [ 'Task_1' ], scope: 'Process_1' }
    ]);
  });

});