import { expect } from 'chai';

import { sortBy, map } from 'min-dash';

import BpmnModdle from 'bpmn-moddle';

import ZeebeModdle from 'zeebe-bpmn-moddle/resources/zeebe';

import fs from 'fs';

import {
  getProcessVariables,
  getVariablesForElement,
  getVariablesForScope
} from '../../../src/zeebe';


describe('zeebe/process variables module', function() {

  describe('#getProcessVariables', function() {

    it('should extract variables - simple process', async function() {

      // given
      const xml = read('test/zeebe/fixtures/simple.bpmn');

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
      const xml = read('test/zeebe/fixtures/sub-process.bpmn');

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
      const xml = read('test/zeebe/fixtures/sub-process-duplicates.bpmn');

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
      const xml = read('test/zeebe/fixtures/sub-process-own-scope.bpmn');

      const definitions = await parse(xml);

      const rootElement = getRootElement(definitions);

      // when
      const variables = await getProcessVariables(rootElement);

      // then
      expect(convertToTestable(variables)).to.eql([
        { name: 'variable3', origin: [ 'SubProcess_1', 'Task_2' ], scope: 'SubProcess_1' },
        { name: 'variable1', origin: [ 'Task_1' ], scope: 'Process_1' },
        { name: 'variable2', origin: [ 'Task_1' ], scope: 'Process_1' }
      ]);
    });


    it('should extract variables - with sub process (own scope, duplicates)', async function() {

      // given
      const xml = read('test/zeebe/fixtures/sub-process-own-scope-duplicates.bpmn');

      const definitions = await parse(xml);

      const rootElement = getRootElement(definitions);

      // when
      const variables = await getProcessVariables(rootElement);

      // then
      expect(convertToTestable(variables)).to.eql([
        { name: 'variable3', origin: [ 'SubProcess_1', 'Task_2' ], scope: 'SubProcess_1' },
        { name: 'variable2', origin: [ 'SubProcess_1', 'Task_2' ], scope: 'SubProcess_1' },
        { name: 'variable1', origin: [ 'Task_1' ], scope: 'Process_1' },
        { name: 'variable2', origin: [ 'Task_1' ], scope: 'Process_1' },
      ]);
    });


    it('should extract variables - sub process (output mapping)', async function() {

      // given
      const xml = read('test/zeebe/fixtures/sub-process-output-mapping.bpmn');

      const definitions = await parse(xml);

      const rootElement = getRootElement(definitions);

      // when
      const variables = await getProcessVariables(rootElement);

      // then
      expect(convertToTestable(variables)).to.eql([
        { name: 'variable3', origin: [ 'SubProcess_1', 'Task_2' ], scope: 'SubProcess_1' },
        { name: 'variable1', origin: [ 'Task_1' ], scope: 'Process_1' },
        { name: 'variable2', origin: [ 'Task_1' ], scope: 'Process_1' },
        { name: 'variable3', origin: [ 'SubProcess_1' ], scope: 'Process_1' },
      ]);
    });


    it('should extract variables - nested sub processes', async function() {

      // given
      const xml = read('test/zeebe/fixtures/nested-sub-process.bpmn');

      const definitions = await parse(xml);

      const rootElement = getRootElement(definitions);

      // when
      const variables = await getProcessVariables(rootElement);

      // then
      expect(convertToTestable(variables)).to.eql([
        { name: 'variable3', origin: [ 'SubProcess_1', 'Task_2' ], scope: 'SubProcess_1' },
        { name: 'variable1', origin: [ 'Task_1' ], scope: 'Process_1' },
        { name: 'variable2', origin: [ 'Task_1' ], scope: 'Process_1' },
      ]);
    });


    it('should extract variables - additional extractors', async function() {

      // given
      const xml = read('test/zeebe/fixtures/simple.bpmn');

      const definitions = await parse(xml);

      const rootElement = getRootElement(definitions);

      // when
      const variables = await getProcessVariables(rootElement, createAdditionExtractors(rootElement));

      // then
      expect(convertToTestable(variables)).to.eql([
        { name: 'variable1', origin: [ 'Task_1' ], scope: 'Process_1' },
        { name: 'variable2', origin: [ 'Task_1' ], scope: 'Process_1' },
        { name: 'additionalVariable', origin: [ 'Process_1' ], scope: 'Process_1' },
      ]);

    });


    it('should extract variables - additional extractors (async)', async function() {

      // given
      const xml = read('test/zeebe/fixtures/simple.bpmn');

      const definitions = await parse(xml);

      const rootElement = getRootElement(definitions);

      // when
      const variables = await getProcessVariables(rootElement, createAdditionExtractors(rootElement, true));

      // then
      expect(convertToTestable(variables)).to.eql([
        { name: 'variable1', origin: [ 'Task_1' ], scope: 'Process_1' },
        { name: 'variable2', origin: [ 'Task_1' ], scope: 'Process_1' },
        { name: 'additionalVariable', origin: [ 'Process_1' ], scope: 'Process_1' },
      ]);

    });


    it('should extract variables with re define resultVariable scope if output mapping exists - script task', async function() {

      // given
      const xml = read('test/zeebe/fixtures/script-task-output.bpmn');

      const definitions = await parse(xml);

      const rootElement = getRootElement(definitions);

      // when
      const variables = await getProcessVariables(rootElement);

      // then
      expect(convertToTestable(variables)).to.eql([
        { name: 'output', origin: [ 'Task_1' ], scope: 'Process_1' },
        { name: 'foo', origin: [ 'Task_1' ], scope: 'Task_1' },
      ]);
    });

  });


  describe('#getVariablesForScope', function() {

    it('should extract available variables - process', async function() {

      // given
      const xml = read('test/zeebe/fixtures/sub-process-own-scope.bpmn');

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
      const xml = read('test/zeebe/fixtures/sub-process-own-scope.bpmn');

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
        { name: 'variable3', origin: [ 'SubProcess_1', 'Task_2' ], scope: 'SubProcess_1' }
      ]);
    });


    it('should extract available variables - additional extractors', async function() {

      // given
      const xml = read('test/zeebe/fixtures/sub-process-own-scope.bpmn');

      const definitions = await parse(xml);

      const rootElement = getRootElement(definitions);

      // when
      const variables = await getVariablesForScope('Process_1', rootElement, createAdditionExtractors(rootElement));

      // then
      expect(convertToTestable(variables)).to.eql([
        { name: 'variable1', origin: [ 'Task_1' ], scope: 'Process_1' },
        { name: 'variable2', origin: [ 'Task_1' ], scope: 'Process_1' },
        { name: 'additionalVariable', origin: [ 'Process_1' ], scope: 'Process_1' },
      ]);

    });


    it('should extract available variables - additional extractors (async)', async function() {

      // given
      const xml = read('test/zeebe/fixtures/sub-process-own-scope.bpmn');

      const definitions = await parse(xml);

      const rootElement = getRootElement(definitions);

      // when
      const variables = await getVariablesForScope('Process_1', rootElement, createAdditionExtractors(rootElement, true));

      // then
      expect(convertToTestable(variables)).to.eql([
        { name: 'variable1', origin: [ 'Task_1' ], scope: 'Process_1' },
        { name: 'variable2', origin: [ 'Task_1' ], scope: 'Process_1' },
        { name: 'additionalVariable', origin: [ 'Process_1' ], scope: 'Process_1' },
      ]);

    });

  });


  describe('#getVariablesForElement', function() {

    it('should extract available variables - process', async function() {

      // given
      const xml = read('test/zeebe/fixtures/sub-process-own-scope.bpmn');

      const definitions = await parse(xml);

      const rootElement = getRootElement(definitions);

      // when
      const variables = await getVariablesForElement(rootElement);

      // then
      expect(convertToTestable(variables)).to.eql([
        { name: 'variable1', origin: [ 'Task_1' ], scope: 'Process_1' },
        { name: 'variable2', origin: [ 'Task_1' ], scope: 'Process_1' },
      ]);
    });


    it('should extract available variables - sub process', async function() {

      // given
      const xml = read('test/zeebe/fixtures/sub-process-own-scope.bpmn');

      const definitions = await parse(xml);

      const rootElement = getRootElement(definitions);

      const subProcess = rootElement.flowElements[0];

      // when
      const variables = await getVariablesForElement(subProcess);

      const sortedVariables = sortVariablesByName(variables);

      // then

      // own + all variables from parent scope
      expect(convertToTestable(sortedVariables)).to.eql([
        { name: 'variable1', origin: [ 'Task_1' ], scope: 'Process_1' },
        { name: 'variable2', origin: [ 'Task_1' ], scope: 'Process_1' },
        { name: 'variable3', origin: [ 'SubProcess_1', 'Task_2' ], scope: 'SubProcess_1' }
      ]);
    });


    it('should extract available variables - additional extractors', async function() {

      // given
      const xml = read('test/zeebe/fixtures/sub-process-own-scope.bpmn');

      const definitions = await parse(xml);

      const rootElement = getRootElement(definitions);

      // when
      const variables = await getVariablesForElement(rootElement, createAdditionExtractors(rootElement));

      // then
      expect(convertToTestable(variables)).to.eql([
        { name: 'variable1', origin: [ 'Task_1' ], scope: 'Process_1' },
        { name: 'variable2', origin: [ 'Task_1' ], scope: 'Process_1' },
        { name: 'additionalVariable', origin: [ 'Process_1' ], scope: 'Process_1' },
      ]);

    });


    it('should extract available variables - additional extractors', async function() {

      // given
      const xml = read('test/zeebe/fixtures/sub-process-own-scope.bpmn');

      const definitions = await parse(xml);

      const rootElement = getRootElement(definitions);

      // when
      const variables = await getVariablesForElement(rootElement, createAdditionExtractors(rootElement, true));

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
    zeebe: ZeebeModdle,
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

function createAdditionExtractors(rootElement, async = false) {

  const additionalVariable = {
    name: 'additionalVariable',
    scope: rootElement,
    origin: [ rootElement ]
  };

  const extractor = function(options) {
    const {
      processVariables
    } = options;

    processVariables.push(additionalVariable);
  };

  const asyncExtractor = async function(options) {
    const {
      processVariables
    } = options;

    await new Promise(resolve => setTimeout(resolve, 0));

    processVariables.push(additionalVariable);
  };

  return [
    async ? asyncExtractor : extractor
  ];
}