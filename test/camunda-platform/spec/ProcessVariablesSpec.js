import { expect } from 'chai';

import { sortBy, map } from 'min-dash';

import { BpmnModdle } from 'bpmn-moddle';

import CamundaBpmnModdle from 'camunda-bpmn-moddle/resources/camunda.json' with { type: 'json' };

import fs from 'fs';

import {
  getProcessVariables,
  getVariablesForScope
} from '@bpmn-io/extract-process-variables';


describe('process variables module', function() {

  describe('#getProcessVariables', function() {

    it('should extract variables - simple process', async function() {

      // given
      const xml = read('test/camunda-platform/fixtures/simple.bpmn');

      const definitions = await parse(xml);

      const rootElement = getRootElement(definitions);

      // when
      const variables = await getProcessVariables(rootElement);

      // then
      expect(convertToTestable(variables)).to.eql([
        { name: 'variable1', origin: [ 'Task_1' ], scope: 'Process_1' },
        { name: 'variable2', origin: [ 'Task_1' ], scope: 'Process_1' },
      ]);
    });


    it('should extract variables - with sub process', async function() {

      // given
      const xml = read('test/camunda-platform/fixtures/sub-process.bpmn');

      const definitions = await parse(xml);

      const rootElement = getRootElement(definitions);

      // when
      const variables = await getProcessVariables(rootElement);

      // then
      expect(convertToTestable(variables)).to.eql([
        { name: 'variable1', origin: [ 'Task_1' ], scope: 'Process_1' },
        { name: 'variable2', origin: [ 'Task_1' ], scope: 'Process_1' },
        { name: 'variable3', origin: [ 'Task_2' ], scope: 'Process_1' },
      ]);
    });


    it('should extract variables - with sub process (duplicated vars)', async function() {

      // given
      const xml = read('test/camunda-platform/fixtures/sub-process-duplicates.bpmn');

      const definitions = await parse(xml);

      const rootElement = getRootElement(definitions);

      // when
      const variables = await getProcessVariables(rootElement);

      // then
      expect(convertToTestable(variables)).to.eql([
        { name: 'variable1', origin: [ 'Task_1', 'Task_2' ], scope: 'Process_1' },
        { name: 'variable2', origin: [ 'Task_1' ], scope: 'Process_1' },
        { name: 'variable3', origin: [ 'Task_2' ], scope: 'Process_1' },
      ]);
    });


    it('should extract variables - with sub process (own scope)', async function() {

      // given
      const xml = read('test/camunda-platform/fixtures/sub-process-own-scope.bpmn');

      const definitions = await parse(xml);

      const rootElement = getRootElement(definitions);

      // when
      const variables = await getProcessVariables(rootElement);

      // then
      expect(convertToTestable(variables)).to.eql([
        { name: 'variable1', origin: [ 'Task_1' ], scope: 'Process_1' },
        { name: 'variable2', origin: [ 'Task_1' ], scope: 'Process_1' },
        { name: 'variable3', origin: [ 'Task_2' ], scope: 'SubProcess_1' },
      ]);
    });


    it('should extract variables - with sub process (own scope, duplicates)', async function() {

      // given
      const xml = read('test/camunda-platform/fixtures/sub-process-own-scope-duplicates.bpmn');

      const definitions = await parse(xml);

      const rootElement = getRootElement(definitions);

      // when
      const variables = await getProcessVariables(rootElement);

      // then
      expect(convertToTestable(variables)).to.eql([
        { name: 'variable1', origin: [ 'Task_1' ], scope: 'Process_1' },
        { name: 'variable2', origin: [ 'Task_1' ], scope: 'Process_1' },
        { name: 'variable2', origin: [ 'Task_2' ], scope: 'SubProcess_1' },
        { name: 'variable3', origin: [ 'Task_2' ], scope: 'SubProcess_1' },
      ]);
    });


    it('should extract variables - sub process (output mapping)', async function() {

      // given
      const xml = read('test/camunda-platform/fixtures/sub-process-output-mapping.bpmn');

      const definitions = await parse(xml);

      const rootElement = getRootElement(definitions);

      // when
      const variables = await getProcessVariables(rootElement);

      // then
      expect(convertToTestable(variables)).to.eql([
        { name: 'variable1', origin: [ 'Task_1' ], scope: 'Process_1' },
        { name: 'variable2', origin: [ 'Task_1' ], scope: 'Process_1' },
        { name: 'variable3', origin: [ 'SubProcess_1' ], scope: 'Process_1' },
        { name: 'variable3', origin: [ 'Task_2' ], scope: 'SubProcess_1' },
      ]);
    });


    it('should extract variables - nested sub processes', async function() {

      // given
      const xml = read('test/camunda-platform/fixtures/nested-sub-process.bpmn');

      const definitions = await parse(xml);

      const rootElement = getRootElement(definitions);

      // when
      const variables = await getProcessVariables(rootElement);

      // then
      expect(convertToTestable(variables)).to.eql([
        { name: 'variable1', origin: [ 'Task_1' ], scope: 'Process_1' },
        { name: 'variable2', origin: [ 'Task_1' ], scope: 'Process_1' },
        { name: 'variable3', origin: [ 'Task_2' ], scope: 'SubProcess_1' },
      ]);
    });


    it('should extract variables - complex', async function() {

      // given
      const xml = read('test/camunda-platform/fixtures/complex.bpmn');

      const definitions = await parse(xml);

      const rootElement = getRootElement(definitions);

      // when
      const variables = await getProcessVariables(rootElement);

      const sortedVariables = sortVariablesByName(variables);

      // then
      expect(convertToTestable(sortedVariables)).to.eql([
        { name: 'variable01', origin: [ 'Task_1' ], scope: 'Process_1' },
        { name: 'variable02', origin: [ 'Event_2' ], scope: 'Process_1' },
        { name: 'variable03', origin: [ 'SubProcess_1' ], scope: 'Process_1' },
        { name: 'variable03', origin: [ 'Task_3' ], scope: 'SubProcess_1' },
        { name: 'variable04', origin: [ 'Task_4' ], scope: 'Process_1' },
        { name: 'variable05', origin: [ 'Task_5' ], scope: 'Process_1' },
        { name: 'variable06', origin: [ 'Event_5' ], scope: 'Process_1' },
        { name: 'variable07', origin: [ 'Event_5' ], scope: 'Process_1' },
        { name: 'variable08', origin: [ 'Task_7' ], scope: 'Process_1' },
        { name: 'variable09', origin: [ 'Event_6' ], scope: 'Process_1' },
        { name: 'variable10', origin: [ 'Event_8' ], scope: 'SubProcess_2' },
        { name: 'variable11', origin: [ 'Event_8' ], scope: 'Process_1' },
        { name: 'variable12', origin: [ 'Task_10' ], scope: 'SubProcess_2' },
        { name: 'variable13', origin: [ 'Task_10' ], scope: 'SubProcess_3' },
        { name: 'variable14', origin: [ 'Task_10' ], scope: 'Process_1' },
        { name: 'variable15', origin: [ 'Task_11' ], scope: 'Process_1' },
        { name: 'variable16', origin: [ 'Task_12' ], scope: 'Process_1' },
      ]);
    });


    it('should extract variables - additional extractors', async function() {

      // given
      const xml = read('test/camunda-platform/fixtures/simple.bpmn');

      const definitions = await parse(xml);

      const rootElement = getRootElement(definitions);

      // when
      const variables = await getProcessVariables(rootElement, [
        additionalExtractor(rootElement)
      ]);

      // then
      expect(convertToTestable(variables)).to.eql([
        { name: 'variable1', origin: [ 'Task_1' ], scope: 'Process_1' },
        { name: 'variable2', origin: [ 'Task_1' ], scope: 'Process_1' },
        { name: 'additionalVariable', origin: [ 'Process_1' ], scope: 'Process_1' },
      ]);

    });


    it('should extract variables - additional extractors (async)', async function() {

      // given
      const xml = read('test/camunda-platform/fixtures/simple.bpmn');

      const definitions = await parse(xml);

      const rootElement = getRootElement(definitions);

      // when
      const variables = await getProcessVariables(rootElement, [
        asyncAdditionalExtractor(rootElement)
      ]);

      // then
      expect(convertToTestable(variables)).to.eql([
        { name: 'variable1', origin: [ 'Task_1' ], scope: 'Process_1' },
        { name: 'variable2', origin: [ 'Task_1' ], scope: 'Process_1' },
        { name: 'additionalVariable', origin: [ 'Process_1' ], scope: 'Process_1' },
      ]);

    });

  });


  describe('#getVariablesForScope', function() {

    it('should extract available variables - process', async function() {

      // given
      const xml = read('test/camunda-platform/fixtures/sub-process-own-scope.bpmn');

      const definitions = await parse(xml);

      const rootElement = getRootElement(definitions);

      // when
      const variables = await getVariablesForScope('Process_1', rootElement);

      // then
      expect(convertToTestable(variables)).to.eql([
        { name: 'variable1', origin: [ 'Task_1' ], scope: 'Process_1' },
        { name: 'variable2', origin: [ 'Task_1' ], scope: 'Process_1' },
      ]);
    });


    it('should extract available variables - sub process', async function() {

      // given
      const xml = read('test/camunda-platform/fixtures/sub-process-own-scope.bpmn');

      const definitions = await parse(xml);

      const rootElement = getRootElement(definitions);

      // when
      const variables = await getVariablesForScope('SubProcess_1', rootElement);

      const sortedVariables = sortVariablesByName(variables);

      // then

      // own + all variables from parent scope
      expect(convertToTestable(sortedVariables)).to.eql([
        { name: 'variable1', origin: [ 'Task_1' ], scope: 'Process_1' },
        { name: 'variable2', origin: [ 'Task_1' ], scope: 'Process_1' },
        { name: 'variable3', origin: [ 'Task_2' ], scope: 'SubProcess_1' }
      ]);
    });


    it('should extract available variables - complex', async function() {

      // given
      const xml = read('test/camunda-platform/fixtures/complex.bpmn');

      const definitions = await parse(xml);

      const rootElement = getRootElement(definitions);

      // when
      const variables = await getVariablesForScope('SubProcess_2', rootElement);

      const sortedVariables = sortVariablesByName(variables);

      // then

      // own + all variables from parent scope
      expect(convertToTestable(sortedVariables)).to.eql([
        { name: 'variable01', origin: [ 'Task_1' ], scope: 'Process_1' },
        { name: 'variable02', origin: [ 'Event_2' ], scope: 'Process_1' },
        { name: 'variable03', origin: [ 'SubProcess_1' ], scope: 'Process_1' },
        { name: 'variable04', origin: [ 'Task_4' ], scope: 'Process_1' },
        { name: 'variable05', origin: [ 'Task_5' ], scope: 'Process_1' },
        { name: 'variable06', origin: [ 'Event_5' ], scope: 'Process_1' },
        { name: 'variable07', origin: [ 'Event_5' ], scope: 'Process_1' },
        { name: 'variable08', origin: [ 'Task_7' ], scope: 'Process_1' },
        { name: 'variable09', origin: [ 'Event_6' ], scope: 'Process_1' },
        { name: 'variable10', origin: [ 'Event_8' ], scope: 'SubProcess_2' },
        { name: 'variable11', origin: [ 'Event_8' ], scope: 'Process_1' },
        { name: 'variable12', origin: [ 'Task_10' ], scope: 'SubProcess_2' },
        { name: 'variable14', origin: [ 'Task_10' ], scope: 'Process_1' },
        { name: 'variable15', origin: [ 'Task_11' ], scope: 'Process_1' },
        { name: 'variable16', origin: [ 'Task_12' ], scope: 'Process_1' },
      ]);
    });


    it('should extract available variables - additional extractors', async function() {

      // given
      const xml = read('test/camunda-platform/fixtures/simple.bpmn');

      const definitions = await parse(xml);

      const rootElement = getRootElement(definitions);

      // when
      const variables = await getVariablesForScope('Process_1', rootElement, [
        additionalExtractor(rootElement)
      ]);

      // then
      expect(convertToTestable(variables)).to.eql([
        { name: 'variable1', origin: [ 'Task_1' ], scope: 'Process_1' },
        { name: 'variable2', origin: [ 'Task_1' ], scope: 'Process_1' },
        { name: 'additionalVariable', origin: [ 'Process_1' ], scope: 'Process_1' },
      ]);

    });


    it('should extract available variables - additional extractors (async)', async function() {

      // given
      const xml = read('test/camunda-platform/fixtures/simple.bpmn');

      const definitions = await parse(xml);

      const rootElement = getRootElement(definitions);

      // when
      const variables = await getVariablesForScope('Process_1', rootElement, [
        asyncAdditionalExtractor(rootElement)
      ]);

      // then
      expect(convertToTestable(variables)).to.eql([
        { name: 'variable1', origin: [ 'Task_1' ], scope: 'Process_1' },
        { name: 'variable2', origin: [ 'Task_1' ], scope: 'Process_1' },
        { name: 'additionalVariable', origin: [ 'Process_1' ], scope: 'Process_1' },
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

function asyncAdditionalExtractor(rootElement) {

  const additionalVariable = {
    name: 'additionalVariable',
    scope: rootElement,
    origin: [ rootElement ]
  };

  return async function(options) {
    const {
      processVariables
    } = options;

    await new Promise(resolve => setTimeout(resolve, 0));

    processVariables.push(additionalVariable);
  };
}

function additionalExtractor(rootElement) {

  const additionalVariable = {
    name: 'additionalVariable',
    scope: rootElement,
    origin: [ rootElement ]
  };

  return function(options) {
    const {
      processVariables
    } = options;

    processVariables.push(additionalVariable);
  };
}