import { expect } from 'chai';

import extractVariables from '../../../../src/zeebe/extractors/extractOutputMappings.js';

import { selfAndAllFlowElements } from '../../../../src/shared/util/ElementsUtil.js';
import { convertToTestable, getRootElement, readModel } from '../../TestHelper.js';


describe('zeebe/extractors - output mappings', function() {

  it('should extract variables / simple', async function() {

    // given
    const model = await readModel('test/zeebe/fixtures/simple.bpmn');

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
      { name: 'variable1', origin: [ 'Task_1' ], scope: 'Process_1' },
      { name: 'variable2', origin: [ 'Task_1' ], scope: 'Process_1' },
    ]);
  });


  it('should extract variables / sub process', async function() {

    // given
    const model = await readModel('test/zeebe/fixtures/sub-process.output-mapping.bpmn');

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
      { name: 'variable1', origin: [ 'Task_1' ], scope: 'Process_1' },
      { name: 'variable2', origin: [ 'Task_1' ], scope: 'Process_1' },
      { name: 'variable3', origin: [ 'SubProcess_1' ], scope: 'Process_1' },
      { name: 'variable3', origin: [ 'Task_2' ], scope: 'SubProcess_1' },
    ]);
  });


  it('should extract variables / sub process / partial names', async function() {

    // given
    const model = await readModel('test/zeebe/fixtures/sub-process.output-mapping-partial-names.bpmn');

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
      { name: 'variable3', origin: [ 'SubProcess_1' ], scope: 'Process_1' },
      { name: 'variable2.foo', origin: [ 'SubProcess_1', 'Task_2', 'Task_1' ], scope: 'Process_1' },
      { name: 'variable2.bar', origin: [ 'SubProcess_1' ], scope: 'Process_1' },
      { name: 'variable3.woop', origin: [ 'Task_2' ], scope: 'SubProcess_1' },
      { name: 'variable4.wap', origin: [ 'Task_2' ], scope: 'SubProcess_1' },
      { name: 'variable4.other', origin: [ 'Task_2' ], scope: 'SubProcess_1' },
      { name: 'variable1.foo', origin: [ 'Task_1' ], scope: 'Process_1' }
    ]);
  });


  it('should ignore invalid output mapping', async function() {

    // given
    const model = await readModel('test/zeebe/fixtures/errors.bpmn');

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