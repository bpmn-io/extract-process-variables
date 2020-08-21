import { expect } from 'chai';

import { sortBy, map } from 'min-dash';

import BpmnModdle from 'bpmn-moddle';

import CamundaBpmnModdle from 'camunda-bpmn-moddle/resources/camunda';

import fs from 'fs';

import {
  getProcessVariables,
  getVariablesForScope
} from '../../src';


describe('process variables module', function() {

  describe('#getProcessVariables', function() {

    it('should extract variables - simple process', async function() {

      // given
      const xml = read('test/fixtures/simple.bpmn');

      const definitions = await parse(xml);

      const rootElement = getRootElement(definitions);

      // when
      const variables = getProcessVariables(rootElement);

      // then
      expect(convertToTestable(variables)).to.eql([
        { name: 'variable1', origin: ['Task_1'], scope: 'Process_1' },
        { name: 'variable2', origin: ['Task_1'], scope: 'Process_1' },
      ]);
    });


    it('should extract variables - with sub process', async function() {

      // given
      const xml = read('test/fixtures/sub-process.bpmn');

      const definitions = await parse(xml);

      const rootElement = getRootElement(definitions);

      // when
      const variables = getProcessVariables(rootElement);

      // then
      expect(convertToTestable(variables)).to.eql([
        { name: 'variable1', origin: ['Task_1'], scope: 'Process_1' },
        { name: 'variable2', origin: ['Task_1'], scope: 'Process_1' },
        { name: 'variable3', origin: ['Task_2'], scope: 'Process_1' },
      ]);
    });


    it('should extract variables - with sub process (duplicated vars)', async function() {

      // given
      const xml = read('test/fixtures/sub-process-duplicates.bpmn');

      const definitions = await parse(xml);

      const rootElement = getRootElement(definitions);

      // when
      const variables = getProcessVariables(rootElement);

      // then
      expect(convertToTestable(variables)).to.eql([
        { name: 'variable1', origin: ['Task_1', 'Task_2'], scope: 'Process_1' },
        { name: 'variable2', origin: ['Task_1'], scope: 'Process_1' },
        { name: 'variable3', origin: ['Task_2'], scope: 'Process_1' },
      ]);
    });


    it('should extract variables - with sub process (own scope)', async function() {

      // given
      const xml = read('test/fixtures/sub-process-own-scope.bpmn');

      const definitions = await parse(xml);

      const rootElement = getRootElement(definitions);

      // when
      const variables = getProcessVariables(rootElement);

      // then
      expect(convertToTestable(variables)).to.eql([
        { name: 'variable1', origin: ['Task_1'], scope: 'Process_1' },
        { name: 'variable2', origin: ['Task_1'], scope: 'Process_1' },
        { name: 'variable3', origin: ['Task_2'], scope: 'SubProcess_1' },
      ]);
    });


    it('should extract variables - with sub process (own scope, duplicates)', async function() {

      // given
      const xml = read('test/fixtures/sub-process-own-scope-duplicates.bpmn');

      const definitions = await parse(xml);

      const rootElement = getRootElement(definitions);

      // when
      const variables = getProcessVariables(rootElement);

      // then
      expect(convertToTestable(variables)).to.eql([
        { name: 'variable1', origin: ['Task_1'], scope: 'Process_1' },
        { name: 'variable2', origin: ['Task_1'], scope: 'Process_1' },
        { name: 'variable2', origin: ['Task_2'], scope: 'SubProcess_1' },
        { name: 'variable3', origin: ['Task_2'], scope: 'SubProcess_1' },
      ]);
    });


    it('should extract variables - sub process (output mapping)', async function() {

      // given
      const xml = read('test/fixtures/sub-process-output-mapping.bpmn');

      const definitions = await parse(xml);

      const rootElement = getRootElement(definitions);

      // when
      const variables = getProcessVariables(rootElement);

      // then
      expect(convertToTestable(variables)).to.eql([
        { name: 'variable1', origin: ['Task_1'], scope: 'Process_1' },
        { name: 'variable2', origin: ['Task_1'], scope: 'Process_1' },
        { name: 'variable3', origin: ['SubProcess_1'], scope: 'Process_1' },
        { name: 'variable3', origin: ['Task_2'], scope: 'SubProcess_1' },
      ]);
    });


    it('should extract variables - nested sub processes', async function() {

      // given
      const xml = read('test/fixtures/nested-sub-process.bpmn');

      const definitions = await parse(xml);

      const rootElement = getRootElement(definitions);

      // when
      const variables = getProcessVariables(rootElement);

      // then
      expect(convertToTestable(variables)).to.eql([
        { name: 'variable1', origin: ['Task_1'], scope: 'Process_1' },
        { name: 'variable2', origin: ['Task_1'], scope: 'Process_1' },
        { name: 'variable3', origin: ['Task_2'], scope: 'SubProcess_1' },
      ]);
    });


    it('should extract variables - complex', async function() {

      // given
      const xml = read('test/fixtures/complex.bpmn');

      const definitions = await parse(xml);

      const rootElement = getRootElement(definitions);

      // when
      const variables = getProcessVariables(rootElement);

      const sortedVariables = sortVariablesByName(variables);

      // then
      expect(convertToTestable(sortedVariables)).to.eql([
        { name: 'variable01', origin: ['Task_1'], scope: 'Process_1' },
        { name: 'variable02', origin: ['Event_2'], scope: 'Process_1' },
        { name: 'variable03', origin: ['SubProcess_1'], scope: 'Process_1' },
        { name: 'variable03', origin: ['Task_3'], scope: 'SubProcess_1' },
        { name: 'variable04', origin: ['Task_4'], scope: 'Process_1' },
        { name: 'variable05', origin: ['Task_5'], scope: 'Process_1' },
        { name: 'variable06', origin: ['Event_5'], scope: 'Process_1' },
        { name: 'variable07', origin: ['Event_5'], scope: 'Process_1' },
        { name: 'variable08', origin: ['Task_7'], scope: 'Process_1' },
        { name: 'variable09', origin: ['Event_6'], scope: 'Process_1' },
        { name: 'variable10', origin: ['Event_8'], scope: 'SubProcess_2' },
        { name: 'variable11', origin: ['Event_8'], scope: 'Process_1' },
        { name: 'variable12', origin: ['Task_10'], scope: 'SubProcess_2' },
        { name: 'variable13', origin: ['Task_10'], scope: 'SubProcess_3' },
        { name: 'variable14', origin: ['Task_10'], scope: 'Process_1' },
        { name: 'variable15', origin: ['Task_11'], scope: 'Process_1' },
        { name: 'variable16', origin: ['Task_12'], scope: 'Process_1' },
      ]);
    });
  });


  describe('#getVariablesForScope', function() {

    it('should extract available variables - process', async function() {

      // given
      const xml = read('test/fixtures/sub-process-own-scope.bpmn');

      const definitions = await parse(xml);

      const rootElement = getRootElement(definitions);

      // when
      const variables = getVariablesForScope('Process_1', rootElement);

      // then
      expect(convertToTestable(variables)).to.eql([
        { name: 'variable1', origin: ['Task_1'], scope: 'Process_1' },
        { name: 'variable2', origin: ['Task_1'], scope: 'Process_1' },
      ]);
    });


    it('should extract available variables - sub process', async function() {

      // given
      const xml = read('test/fixtures/sub-process-own-scope.bpmn');

      const definitions = await parse(xml);

      const rootElement = getRootElement(definitions);

      // when
      const variables = getVariablesForScope('SubProcess_1', rootElement);

      const sortedVariables = sortVariablesByName(variables);

      // then

      // own + all variables from parent scope
      expect(convertToTestable(sortedVariables)).to.eql([
        { name: 'variable1', origin: ['Task_1'], scope: 'Process_1' },
        { name: 'variable2', origin: ['Task_1'], scope: 'Process_1' },
        { name: 'variable3', origin: ['Task_2'], scope: 'SubProcess_1' }
      ]);
    });


    it('should extract available variables - complex', async function() {

      // given
      const xml = read('test/fixtures/complex.bpmn');

      const definitions = await parse(xml);

      const rootElement = getRootElement(definitions);

      // when
      const variables = getVariablesForScope('SubProcess_2', rootElement);

      const sortedVariables = sortVariablesByName(variables);

      // then

      // own + all variables from parent scope
      expect(convertToTestable(sortedVariables)).to.eql([
        { name: 'variable01', origin: ['Task_1'], scope: 'Process_1' },
        { name: 'variable02', origin: ['Event_2'], scope: 'Process_1' },
        { name: 'variable03', origin: ['SubProcess_1'], scope: 'Process_1' },
        { name: 'variable04', origin: ['Task_4'], scope: 'Process_1' },
        { name: 'variable05', origin: ['Task_5'], scope: 'Process_1' },
        { name: 'variable06', origin: ['Event_5'], scope: 'Process_1' },
        { name: 'variable07', origin: ['Event_5'], scope: 'Process_1' },
        { name: 'variable08', origin: ['Task_7'], scope: 'Process_1' },
        { name: 'variable09', origin: ['Event_6'], scope: 'Process_1' },
        { name: 'variable10', origin: ['Event_8'], scope: 'SubProcess_2' },
        { name: 'variable11', origin: ['Event_8'], scope: 'Process_1' },
        { name: 'variable12', origin: ['Task_10'], scope: 'SubProcess_2' },
        { name: 'variable14', origin: ['Task_10'], scope: 'Process_1' },
        { name: 'variable15', origin: ['Task_11'], scope: 'Process_1' },
        { name: 'variable16', origin: ['Task_12'], scope: 'Process_1' },
      ]);
    });

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

function sortVariablesByName(variables) {
  return sortBy(variables, function(variable) {
    return variable.name;
  });
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
