import { expect } from 'chai';

import { map } from 'min-dash';

import { BpmnModdle } from 'bpmn-moddle';

import ZeebeModdle from 'zeebe-bpmn-moddle/resources/zeebe.json' with { type: 'json' };

import fs from 'fs';

import extractVariables from '../../../../src/zeebe/extractors/extractInputMappings.js';

import { selfAndAllFlowElements } from '../../../../src/shared/util/ElementsUtil.js';


describe('zeebe/extractors - input mappings', function() {

  it('should extract variables from in mappings', async function() {

    // given
    const xml = read('test/zeebe/fixtures/sub-process.input-mapping.bpmn');

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
      { name: 'variable1', origin: [ 'SubProcess_1' ], scope: 'SubProcess_1' },
      { name: 'variable2', origin: [ 'SubProcess_1' ], scope: 'SubProcess_1' },
    ]);
  });

});


// helpers //////////

function getRootElement(definitions) {
  return definitions.get('rootElements')[0];
}

async function parse(xml) {
  const moddle = new BpmnModdle({
    zeebe: ZeebeModdle,
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
