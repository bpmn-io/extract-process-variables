import { expect } from 'chai';

import { map } from 'min-dash';

import BpmnModdle from 'bpmn-moddle';

import CamundaBpmnModdle from 'camunda-bpmn-moddle/resources/camunda';

import fs from 'fs';

import extractVariables from '../../../../src/platform/extractors/extractOutMappings';

import { selfAndAllFlowElements } from '../../../../src/platform/util/ElementsUtil';


describe('extractors - out mappings', function() {

  it('should extract variables from out mappings', async function() {

    // given
    const xml = read('test/platform/fixtures/call-activity.bpmn');

    const definitions = await parse(xml);

    const rootElement = getRootElement(definitions);

    const elements = selfAndAllFlowElements([rootElement], false);

    // when
    const variables = extractVariables({
      elements,
      containerElement: rootElement,
      processVariables: []
    });

    // then
    expect(convertToTestable(variables)).to.eql([
      { name: 'variable1', origin: ['CallActivity'], scope: 'Process_1' },
      { name: 'variable2', origin: ['CallActivity'], scope: 'Process_1' },
    ]);
  });


  it('should NOT extract variable if set as local', async function() {

    // given
    const xml = read('test/platform/fixtures/call-activity-local.bpmn');

    const definitions = await parse(xml);

    const rootElement = getRootElement(definitions);

    const elements = selfAndAllFlowElements([rootElement], false);

    // when
    const variables = extractVariables({
      elements,
      containerElement: rootElement,
      processVariables: []
    });

    // then
    // <variableLocal> should be ignored
    expect(convertToTestable(variables)).to.eql([
      { name: 'variable1', origin: ['CallActivity'], scope: 'Process_1' },
      { name: 'variable2', origin: ['CallActivity'], scope: 'Process_1' },
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
