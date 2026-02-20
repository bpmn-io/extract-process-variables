import { expect } from 'chai';

import extractVariables from '../../../../src/zeebe/extractors/extractOutputCollections.js';

import { selfAndAllFlowElements } from '../../../../src/shared/util/ElementsUtil.js';
import { convertToTestable, getRootElement, readModel } from '../../TestHelper.js';


describe('zeebe/extractors - output collections', function() {

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
      const model = await readModel('test/zeebe/fixtures/sub-process.ad-hoc.bpmn');

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
        { name: 'variables', origin: [ 'SubProcess_1' ], scope: 'Process_1' }
      ]);
    });


    it('should extract variables / scoped', async function() {

      // given
      const model = await readModel('test/zeebe/fixtures/sub-process.ad-hoc-own-scope.bpmn');

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
        { name: 'variables', origin: [ 'SubProcess_1' ], scope: 'SubProcess_1' }
      ]);
    });


    it('should not extract variables / empty loopCharacteristics', async function() {

      // given
      const model = await readModel('test/zeebe/fixtures/sub-process.ad-hoc-empty.bpmn');

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