import { expect } from 'chai';

import { map } from 'min-dash';

import { BpmnModdle } from 'bpmn-moddle';

import CamundaBpmnModdle from 'camunda-bpmn-moddle/resources/camunda.json' with { type: 'json' };

import fs from 'fs';

import extractVariables from '../../../../src/camunda-platform/extractors/extractEventDefinitionVariables.js';

import { selfAndAllFlowElements } from '../../../../src/shared/util/ElementsUtil.js';


describe('camunda-platform / extractors - event definition variables', function() {

  it('should extract variables from error code variable', async function() {

    // given
    const xml = read('test/camunda-platform/fixtures/error-code-variable.bpmn');

    const definitions = await parse(xml);

    const rootElement = getRootElement(definitions);

    const elements = selfAndAllFlowElements([ rootElement ], false);

    // when
    const variables = extractVariables({
      elements,
      containerElement: rootElement,
      processVariables: []
    });

    // then
    expect(convertToTestable(variables)).to.eql([
      { name: 'variable1', origin: [ 'ErrorEvent_1' ], scope: 'Process_1' },
      { name: 'variable2', origin: [ 'ErrorEvent_2' ], scope: 'Process_1' }
    ]);

  });


  it('should extract variables from error message variable', async function() {

    // given
    const xml = read('test/camunda-platform/fixtures/error-message-variable.bpmn');

    const definitions = await parse(xml);

    const rootElement = getRootElement(definitions);

    const elements = selfAndAllFlowElements([ rootElement ], false);

    // when
    const variables = extractVariables({
      elements,
      containerElement: rootElement,
      processVariables: []
    });

    // then
    expect(convertToTestable(variables)).to.eql([
      { name: 'variable1', origin: [ 'ErrorEvent_1' ], scope: 'Process_1' },
      { name: 'variable2', origin: [ 'ErrorEvent_2' ], scope: 'Process_1' }
    ]);

  });


  it('should extract variables from escalation code variable', async function() {

    // given
    const xml = read('test/camunda-platform/fixtures/escalation-code-variable.bpmn');

    const definitions = await parse(xml);

    const rootElement = getRootElement(definitions);

    const elements = selfAndAllFlowElements([ rootElement ], false);

    // when
    const variables = extractVariables({
      elements,
      containerElement: rootElement,
      processVariables: []
    });

    // then
    expect(convertToTestable(variables)).to.eql([
      { name: 'variable1', origin: [ 'EscalationEvent_1' ], scope: 'Process_1' },
      { name: 'variable2', origin: [ 'EscalationEvent_2' ], scope: 'Process_1' }
    ]);

  });

});


// helpers //////////

function getRootElement(definitions) {
  return definitions.get('rootElements')[0];
}

async function parse(xml) {
  const moddle = new BpmnModdle({
    camunda: CamundaBpmnModdle,
  });

  const { rootElement: definitions } = await moddle.fromXML(xml);

  return definitions;
}

function read(path, encoding = 'utf8') {
  return fs.readFileSync(path, encoding);
}

// converts the variables list from full moddle elements to only id, for better testability
function convertToTestable(variables) {
  return map(variables, function(variable) {
    return {
      name: variable.name,
      origin: map(variable.origin, function(origin) {
        return origin.id;
      }),
      scope: variable.scope.id
    };
  });
}
