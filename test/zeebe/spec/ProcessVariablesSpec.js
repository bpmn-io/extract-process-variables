import { expect } from 'chai';

import { sortBy } from 'min-dash';

import {
  convertToTestable,
  getElement,
  getRootElement,
  readModel
} from '../TestHelper.js';

import {
  getProcessVariables,
  getVariablesForElement,
  getVariablesForScope
} from '@bpmn-io/extract-process-variables/zeebe';


describe('zeebe / process variables module', function() {

  describe('#getProcessVariables', function() {

    it('should extract variables / simple', async function() {

      // given
      const model = await readModel('test/zeebe/fixtures/simple.bpmn');

      const rootElement = getRootElement(model);

      // when
      const variables = await getProcessVariables(rootElement);

      // then
      expect(convertToTestable(variables)).to.eql([
        { name: 'variable3', origin: [ 'Task_1' ], scope: 'Task_1' },
        { name: 'variable1', origin: [ 'Task_1' ], scope: 'Process_1' },
        { name: 'variable2', origin: [ 'Task_1' ], scope: 'Process_1' },
      ]);
    });


    it('should extract variables / sub process', async function() {

      // given
      const model = await readModel('test/zeebe/fixtures/sub-process.bpmn');

      const rootElement = getRootElement(model);

      // when
      const variables = await getProcessVariables(rootElement);

      // then
      expect(convertToTestable(variables)).to.eql([
        { name: 'variable1', origin: [ 'Task_1' ], scope: 'Process_1' },
        { name: 'variable2', origin: [ 'Task_1' ], scope: 'Process_1' },
        { name: 'variable3', origin: [ 'Task_2' ], scope: 'Process_1' },
      ]);
    });


    it('should extract variables / sub process / duplicated vars', async function() {

      // given
      const model = await readModel('test/zeebe/fixtures/sub-process.duplicates.bpmn');

      const rootElement = getRootElement(model);

      // when
      const variables = await getProcessVariables(rootElement);

      // then
      expect(convertToTestable(variables)).to.eql([
        { name: 'variable1', origin: [ 'Task_1', 'Task_2' ], scope: 'Process_1' },
        { name: 'variable2', origin: [ 'Task_1' ], scope: 'Process_1' },
        { name: 'variable3', origin: [ 'Task_2' ], scope: 'Process_1' },
      ]);
    });


    it('should extract variables / sub process / own scope', async function() {

      // given
      const model = await readModel('test/zeebe/fixtures/sub-process.own-scope.bpmn');

      const rootElement = getRootElement(model);

      // when
      const variables = await getProcessVariables(rootElement);

      // then
      expect(convertToTestable(variables)).to.eql([
        { name: 'variable3', origin: [ 'SubProcess_1', 'Task_2' ], scope: 'SubProcess_1' },
        { name: 'variable1', origin: [ 'Task_1' ], scope: 'Process_1' },
        { name: 'variable2', origin: [ 'Task_1' ], scope: 'Process_1' }
      ]);
    });


    it('should extract variables / input mapping / same name', async function() {

      // given
      const model = await readModel('test/zeebe/fixtures/sub-process.same-name-different-scope.bpmn');

      const rootElement = getRootElement(model);

      // when
      const variables = await getProcessVariables(rootElement);

      // then
      expect(convertToTestable(variables)).to.eql([
        { name: 'variable1', origin: [ 'SubProcess_1' ], scope: 'SubProcess_1' },
        { name: 'variable1', origin: [ 'Task_1' ], scope: 'Task_1' }
      ]);
    });


    it('should extract variables / sub process / own scope / duplicates', async function() {

      // given
      const model = await readModel('test/zeebe/fixtures/sub-process.own-scope-duplicates.bpmn');

      const rootElement = getRootElement(model);

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


    it('should extract variables / sub process / output mapping', async function() {

      // given
      const model = await readModel('test/zeebe/fixtures/sub-process.output-mapping.bpmn');

      const rootElement = getRootElement(model);

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


    it('should extract variables / sub process / nested sub process', async function() {

      // given
      const model = await readModel('test/zeebe/fixtures/sub-process.nested.bpmn');

      const rootElement = getRootElement(model);

      // when
      const variables = await getProcessVariables(rootElement);

      // then
      expect(convertToTestable(variables)).to.eql([
        { name: 'variable3', origin: [ 'SubProcess_1', 'Task_2' ], scope: 'SubProcess_1' },
        { name: 'variable1', origin: [ 'Task_1' ], scope: 'Process_1' },
        { name: 'variable2', origin: [ 'Task_1' ], scope: 'Process_1' }
      ]);
    });


    it('should extract variables / sub process / nested sub process / duplicate inputs', async function() {

      // given
      const model = await readModel('test/zeebe/fixtures/sub-process.nested-input-same-name.bpmn');

      const rootElement = getRootElement(model);

      // when
      const variables = await getProcessVariables(rootElement);

      // then
      expect(convertToTestable(variables)).to.eql([
        { name: 'variable1', origin: [ 'SubProcess_1' ], scope: 'SubProcess_1' },
        { name: 'variable1', origin: [ 'Task_1' ], scope: 'Task_1' }
      ]);
    });


    describe('additional extractors', function() {

      it('should add global variable', async function() {

        // given
        const model = await readModel('test/zeebe/fixtures/simple.bpmn');

        const rootElement = getRootElement(model);

        // when
        const variables = await getProcessVariables(rootElement, [
          additionalExtractor(rootElement)
        ]);

        // then
        expect(convertToTestable(variables)).to.eql([
          { name: 'variable3', origin: [ 'Task_1' ], scope: 'Task_1' },
          { name: 'variable1', origin: [ 'Task_1' ], scope: 'Process_1' },
          { name: 'variable2', origin: [ 'Task_1' ], scope: 'Process_1' },
          { name: 'additionalVariable', origin: [ 'Process_1' ], scope: 'Process_1' }
        ]);
      });


      it('should add task variable / local', async function() {

        // given
        const model = await readModel('test/zeebe/fixtures/simple.bpmn');

        const rootElement = getRootElement(model);
        const task = getElement(model, 'Task_1');

        // when
        const variables = await getProcessVariables(rootElement, [
          additionalExtractor(task)
        ]);

        // then
        expect(convertToTestable(variables)).to.eql([
          { name: 'variable3', origin: [ 'Task_1' ], scope: 'Task_1' },
          { name: 'variable1', origin: [ 'Task_1' ], scope: 'Process_1' },
          { name: 'variable2', origin: [ 'Task_1' ], scope: 'Process_1' },
          { name: 'additionalVariable', origin: [ 'Task_1' ], scope: 'Task_1' }
        ]);
      });


      it('should add task variable / global', async function() {

        // given
        const model = await readModel('test/zeebe/fixtures/simple.bpmn');

        const rootElement = getRootElement(model);
        const task = getElement(model, 'Task_1');

        // when
        const variables = await getProcessVariables(rootElement, [
          additionalExtractor(task, rootElement)
        ]);

        // then
        expect(convertToTestable(variables)).to.eql([
          { name: 'variable3', origin: [ 'Task_1' ], scope: 'Task_1' },
          { name: 'variable1', origin: [ 'Task_1' ], scope: 'Process_1' },
          { name: 'variable2', origin: [ 'Task_1' ], scope: 'Process_1' },
          { name: 'additionalVariable', origin: [ 'Task_1' ], scope: 'Process_1' }
        ]);
      });

    });


    describe('additional extractors (async)', function() {

      it('should add global variable', async function() {

        // given
        const model = await readModel('test/zeebe/fixtures/simple.bpmn');

        const rootElement = getRootElement(model);

        // when
        const variables = await getProcessVariables(rootElement, [
          asyncAdditionalExtractor(rootElement)
        ]);

        // then
        expect(convertToTestable(variables)).to.eql([
          { name: 'variable3', origin: [ 'Task_1' ], scope: 'Task_1' },
          { name: 'variable1', origin: [ 'Task_1' ], scope: 'Process_1' },
          { name: 'variable2', origin: [ 'Task_1' ], scope: 'Process_1' },
          { name: 'additionalVariable', origin: [ 'Process_1' ], scope: 'Process_1' },
        ]);
      });

    });


    it('should extract variables / script task / result variable, output exists', async function() {

      // given
      const model = await readModel('test/zeebe/fixtures/script-task-result-variable-output.bpmn');

      const rootElement = getRootElement(model);

      // when
      const variables = await getProcessVariables(rootElement);

      // then
      expect(convertToTestable(variables)).to.eql([
        { name: 'bar', origin: [ 'Task_1' ], scope: 'Process_1' },
        { name: 'foo', origin: [ 'Task_2' ], scope: 'Process_1' },
        { name: 'foo', origin: [ 'Task_1' ], scope: 'Task_1' },
        { name: 'ignored', origin: [ 'Task_2' ], scope: 'Task_2' }
      ]);
    });


    it('should not extract variables / script task / result variable, output exists with same name', async function() {

      // given
      const model = await readModel('test/zeebe/fixtures/script-task-result-variable-output-same-name.bpmn');

      const rootElement = getRootElement(model);

      // when
      const variables = await getProcessVariables(rootElement);

      // then
      expect(convertToTestable(variables)).to.eql([
        { name: 'foo', origin: [ 'Task_1' ], scope: 'Process_1' },
        { name: 'foo', origin: [ 'Task_1' ], scope: 'Task_1' }
      ]);
    });


    it('should extract variables / script task / result variable / local', async function() {

      // given
      const model = await readModel('test/zeebe/fixtures/script-task-result-variable-local.bpmn');

      const rootElement = getRootElement(model);

      // when
      const variables = await getProcessVariables(rootElement);

      // then
      expect(convertToTestable(variables)).to.eql([
        { name: 'foo', origin: [ 'Task_1' ], scope: 'Task_1' }
      ]);
    });


    it('should handle errors gracefully', async function() {

      // given
      const model = await readModel('test/zeebe/fixtures/errors.bpmn');

      const rootElement = getRootElement(model);

      // when
      const variables = await getProcessVariables(rootElement);

      // then
      expect(convertToTestable(variables)).to.eql([]);
    });

  });


  describe('#getVariablesForScope', function() {

    it('should extract variables / process', async function() {

      // given
      const model = await readModel('test/zeebe/fixtures/sub-process.own-scope.bpmn');

      const rootElement = getRootElement(model);

      // when
      const variables = await getVariablesForScope('Process_1', rootElement);

      // then
      expect(convertToTestable(variables)).to.eql([
        { name: 'variable1', origin: [ 'Task_1' ], scope: 'Process_1' },
        { name: 'variable2', origin: [ 'Task_1' ], scope: 'Process_1' }
      ]);
    });


    it('should extract variables / sub process', async function() {

      // given
      const model = await readModel('test/zeebe/fixtures/sub-process.own-scope.bpmn');

      const rootElement = getRootElement(model);

      // when
      const variables = await getVariablesForScope('SubProcess_1', rootElement);

      const sortedVariables = sortVariables(variables);

      // then

      // own + all variables from parent scope
      expect(convertToTestable(sortedVariables)).to.eql([
        { name: 'variable1', origin: [ 'Task_1' ], scope: 'Process_1' },
        { name: 'variable2', origin: [ 'Task_1' ], scope: 'Process_1' },
        { name: 'variable3', origin: [ 'SubProcess_1', 'Task_2' ], scope: 'SubProcess_1' }
      ]);
    });


    it('should extract variables / ad-hoc sub process', async function() {

      // given
      const model = await readModel('test/zeebe/fixtures/ad-hoc-sub-process.bpmn');

      const rootElement = getRootElement(model);

      // when
      const variables = await getVariablesForScope('AdHocSubProcess_1', rootElement);

      const sortedVariables = sortVariables(variables);

      // then

      // own + all variables from parent scope
      expect(convertToTestable(sortedVariables)).to.eql([
        { name: 'variable', origin: [ 'Task_1' ], scope: 'Process_1' },
        { name: 'variables', origin: [ 'AdHocSubProcess_1' ], scope: 'AdHocSubProcess_1' },
        { name: 'variables', origin: [ 'AdHocSubProcess_1' ], scope: 'Process_1' }
      ]);
    });


    it('should extract variables / ad-hoc sub process / own scope', async function() {

      // given
      const model = await readModel('test/zeebe/fixtures/ad-hoc-sub-process.own-scope.bpmn');

      const rootElement = getRootElement(model);

      // when
      const variables = await getVariablesForScope('AdHocSubProcess_1', rootElement);

      const sortedVariables = sortVariables(variables);

      // then

      // own + all variables from parent scope
      expect(convertToTestable(sortedVariables)).to.eql([
        {
          name: 'toolResult',
          origin: [
            'AdHocSubProcess_1',
            'Task_1',
            'ScriptTask_1',
            'RuleTask_1'
          ],
          scope: 'AdHocSubProcess_1'
        },
        {
          name: 'toolResult.mail',
          origin: [
            'ScriptTask_2'
          ],
          scope: 'AdHocSubProcess_1'
        },
        { name: 'toolResults', origin: [ 'AdHocSubProcess_1' ], scope: 'AdHocSubProcess_1' },

        // always leaks to parent, is un-local-scopable
        { name: 'toolResults', origin: [ 'AdHocSubProcess_1' ], scope: 'Process_1' }
      ]);
    });


    it('should extract variables / ad-hoc sub process / nested partial writes', async function() {

      // given
      const model = await readModel('test/zeebe/fixtures/ad-hoc-sub-process.nested-partial-writes.bpmn');

      const rootElement = getRootElement(model);

      // when
      const variables = await getVariablesForScope('AdHocSubProcess_1', rootElement);

      const sortedVariables = sortVariables(variables);

      // then

      // own + all variables from parent scope
      expect(convertToTestable(sortedVariables)).to.eql([
        {
          name: 'toolResult',
          origin: [
            'AdHocSubProcess_1',
            'ScriptTask_1',
          ],
          scope: 'AdHocSubProcess_1'
        },
        { name: 'toolResult.email', origin: [ 'ScriptTask_2' ], scope: 'AdHocSubProcess_1' },
        { name: 'toolResults', origin: [ 'AdHocSubProcess_1' ], scope: 'AdHocSubProcess_1' },

        // always leaks to parent, is un-local-scopable
        { name: 'toolResults', origin: [ 'AdHocSubProcess_1' ], scope: 'Process_1' }
      ]);
    });


    it('should extract variables / multi-instance sub process', async function() {

      // given
      const model = await readModel('test/zeebe/fixtures/sub-process.multi-instance.bpmn');

      const rootElement = getRootElement(model);

      // when
      const variables = await getVariablesForScope('SubProcess_1', rootElement);

      const sortedVariables = sortVariables(variables);

      // then

      // own + all variables from parent scope
      expect(convertToTestable(sortedVariables)).to.eql([
        { name: 'inputElement', origin: [ 'SubProcess_1' ], scope: 'SubProcess_1' },
        { name: 'outputCollection', origin: [ 'SubProcess_1' ], scope: 'Process_1' }
      ]);
    });


    it('should extract variables / multi-instance sub process / own scope', async function() {

      // given
      const model = await readModel('test/zeebe/fixtures/sub-process.multi-instance-own-scope.bpmn');

      const rootElement = getRootElement(model);

      // when
      const variables = await getVariablesForScope('SubProcess_1', rootElement);

      const sortedVariables = sortVariables(variables);

      // then

      // own + all variables from parent scope
      expect(convertToTestable(sortedVariables)).to.eql([
        { name: 'inputElement', origin: [ 'SubProcess_1' ], scope: 'SubProcess_1' },
        { name: 'outputCollection', origin: [ 'SubProcess_1' ], scope: 'SubProcess_1' },

        // always leaks to parent, is un-local-scopable
        { name: 'outputCollection', origin: [ 'SubProcess_1' ], scope: 'Process_1' }
      ]);
    });


    describe('additional extractors', function() {

      it('should add global variable', async function() {

        // given
        const model = await readModel('test/zeebe/fixtures/sub-process.own-scope.bpmn');

        const rootElement = getRootElement(model);

        // when
        const variables = await getVariablesForScope('Process_1', rootElement, [
          additionalExtractor(rootElement)
        ]);

        // then
        expect(convertToTestable(variables)).to.eql([
          { name: 'variable1', origin: [ 'Task_1' ], scope: 'Process_1' },
          { name: 'variable2', origin: [ 'Task_1' ], scope: 'Process_1' },
          { name: 'additionalVariable', origin: [ 'Process_1' ], scope: 'Process_1' }
        ]);
      });

    });


    describe('additional extractors (async)', function() {

      it('should add global variable', async function() {

        // given
        const model = await readModel('test/zeebe/fixtures/sub-process.own-scope.bpmn');

        const rootElement = getRootElement(model);

        // when
        const variables = await getVariablesForScope('Process_1', rootElement, [
          asyncAdditionalExtractor(rootElement)
        ]);

        // then
        expect(convertToTestable(variables)).to.eql([
          { name: 'variable1', origin: [ 'Task_1' ], scope: 'Process_1' },
          { name: 'variable2', origin: [ 'Task_1' ], scope: 'Process_1' },
          { name: 'additionalVariable', origin: [ 'Process_1' ], scope: 'Process_1' }
        ]);
      });

    });

  });


  describe('#getVariablesForElement', function() {

    it('should extract variables / process', async function() {

      // given
      const model = await readModel('test/zeebe/fixtures/sub-process.own-scope.bpmn');

      const rootElement = getRootElement(model);

      // when
      const variables = await getVariablesForElement(rootElement);

      // then
      expect(convertToTestable(variables)).to.eql([
        { name: 'variable1', origin: [ 'Task_1' ], scope: 'Process_1' },
        { name: 'variable2', origin: [ 'Task_1' ], scope: 'Process_1' },
      ]);
    });


    it('should extract variables / sub process', async function() {

      // given
      const model = await readModel('test/zeebe/fixtures/sub-process.own-scope.bpmn');

      const subProcess = getElement(model, 'SubProcess_1');

      // when
      const variables = await getVariablesForElement(subProcess);

      const sortedVariables = sortVariables(variables);

      // then

      // own + all variables from parent scope
      expect(convertToTestable(sortedVariables)).to.eql([
        { name: 'variable1', origin: [ 'Task_1' ], scope: 'Process_1' },
        { name: 'variable2', origin: [ 'Task_1' ], scope: 'Process_1' },
        { name: 'variable3', origin: [ 'SubProcess_1', 'Task_2' ], scope: 'SubProcess_1' }
      ]);
    });


    describe('additional extractors', function() {

      it('should add global variable', async function() {

        // given
        const model = await readModel('test/zeebe/fixtures/sub-process.own-scope.bpmn');

        const rootElement = getRootElement(model);

        // when
        const variables = await getVariablesForElement(rootElement, [
          additionalExtractor(rootElement)
        ]);

        // then
        expect(convertToTestable(variables)).to.eql([
          { name: 'variable1', origin: [ 'Task_1' ], scope: 'Process_1' },
          { name: 'variable2', origin: [ 'Task_1' ], scope: 'Process_1' },
          { name: 'additionalVariable', origin: [ 'Process_1' ], scope: 'Process_1' },
        ]);
      });


      it('should add task variable', async function() {

        // given
        const model = await readModel('test/zeebe/fixtures/sub-process.own-scope.bpmn');

        const rootElement = getRootElement(model);
        const task = getElement(model, 'Task_1');

        // when
        const variables = await getVariablesForElement(rootElement, [
          additionalExtractor(task, rootElement)
        ]);

        // then
        expect(convertToTestable(variables)).to.eql([
          { name: 'variable1', origin: [ 'Task_1' ], scope: 'Process_1' },
          { name: 'variable2', origin: [ 'Task_1' ], scope: 'Process_1' },
          { name: 'additionalVariable', origin: [ 'Task_1' ], scope: 'Process_1' }
        ]);
      });


      it('should add task variable / local', async function() {

        // given
        const model = await readModel('test/zeebe/fixtures/sub-process.own-scope.bpmn');

        const task = getElement(model, 'Task_1');

        // when
        const variables = await getVariablesForElement(task, [
          additionalExtractor(task)
        ]);

        // then
        expect(convertToTestable(variables)).to.eql([
          { name: 'additionalVariable', origin: [ 'Task_1' ], scope: 'Task_1' },
          { name: 'variable3', origin: [ 'SubProcess_1', 'Task_2' ], scope: 'SubProcess_1' },
          { name: 'variable1', origin: [ 'Task_1' ], scope: 'Process_1' },
          { name: 'variable2', origin: [ 'Task_1' ], scope: 'Process_1' }
        ]);
      });


      it('should add sub-process variable / local', async function() {

        // given
        const model = await readModel('test/zeebe/fixtures/sub-process.own-scope.bpmn');

        const subProcess = getElement(model, 'SubProcess_1');

        // when
        const variables = await getVariablesForElement(subProcess, [
          additionalExtractor(subProcess)
        ]);

        // then
        expect(convertToTestable(variables)).to.eql([
          { name: 'variable3', origin: [ 'SubProcess_1', 'Task_2' ], scope: 'SubProcess_1' },
          { name: 'additionalVariable', origin: [ 'SubProcess_1' ], scope: 'SubProcess_1' },
          { name: 'variable1', origin: [ 'Task_1' ], scope: 'Process_1' },
          { name: 'variable2', origin: [ 'Task_1' ], scope: 'Process_1' }
        ]);
      });

    });


    describe('additional extractors (async)', function() {

      it('should add global variable', async function() {

        // given
        const model = await readModel('test/zeebe/fixtures/sub-process.own-scope.bpmn');

        const rootElement = getRootElement(model);

        // when
        const variables = await getVariablesForElement(rootElement, [
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

});


// helpers //////////

function sortVariables(variables) {
  return sortBy(variables, function(variable) {
    return `${variable.name} ~ ${variable.scope ?? ''}`;
  });
}

function asyncAdditionalExtractor(element, scope = element) {

  const additionalVariable = {
    name: 'additionalVariable',
    scope,
    origin: [ element ]
  };

  return async function(options) {
    const {
      processVariables
    } = options;

    await new Promise(resolve => setTimeout(resolve, 0));

    processVariables.push(additionalVariable);
  };
}

function additionalExtractor(element, scope = element) {

  const additionalVariable = {
    name: 'additionalVariable',
    scope,
    origin: [ element ]
  };

  return function(options) {
    const {
      processVariables
    } = options;

    processVariables.push(additionalVariable);
  };
}