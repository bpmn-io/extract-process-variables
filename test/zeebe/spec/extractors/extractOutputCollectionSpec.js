import { expect } from 'chai';

import extractVariables from '../../../../src/zeebe/extractors/extractOutputCollections.js';

import { selfAndAllFlowElements } from '../../../../src/shared/util/ElementsUtil.js';
import { convertToTestable, getRootElement, readModel } from '../../TestHelper.js';


describe('zeebe / extractors - output collections', function() {

  describe('multi-instance sub process', function() {

    it('should extract variables', async function() {

      // given
      const model = await readModel('test/zeebe/fixtures/sub-process.multi-instance.bpmn');

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
        { name: 'outputCollection', origin: [ 'SubProcess_1' ], scope: 'Process_1' }
      ]);
    });


    it('should extract variables / un-local-scopable', async function() {

      // given
      const model = await readModel('test/zeebe/fixtures/sub-process.multi-instance-own-scope.bpmn');

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

        // always leaks to parent, is un-local-scopable
        { name: 'outputCollection', origin: [ 'SubProcess_1' ], scope: 'Process_1' }
      ]);
    });


    it('should not extract variables / empty loopCharacteristics', async function() {

      // given
      const model = await readModel('test/zeebe/fixtures/sub-process.multi-instance-empty.bpmn');

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


  describe('ad-hoc sub process', function() {

    it('should extract variables', async function() {

      // given
      const model = await readModel('test/zeebe/fixtures/ad-hoc-sub-process.bpmn');

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
        { name: 'variables', origin: [ 'AdHocSubProcess_1' ], scope: 'AdHocSubProcess_1' },
        { name: 'variables', origin: [ 'AdHocSubProcess_1' ], scope: 'Process_1' }
      ]);
    });


    it('should extract variables / un-local-scopable', async function() {

      // given
      const model = await readModel('test/zeebe/fixtures/ad-hoc-sub-process.own-scope.bpmn');

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
        { name: 'toolResults', origin: [ 'AdHocSubProcess_1' ], scope: 'AdHocSubProcess_1' },

        // always leaks to parent, is un-local-scopable
        { name: 'toolResults', origin: [ 'AdHocSubProcess_1' ], scope: 'Process_1' }
      ]);
    });


    it('should not extract variables / missing output collection', async function() {

      // given
      const model = await readModel('test/zeebe/fixtures/ad-hoc-sub-process.no-output-collection.bpmn');

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

});