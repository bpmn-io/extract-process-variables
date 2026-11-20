import { expect } from 'chai';

import { selfAndAllFlowElements } from '../../../../src/shared/util/ElementsUtil.js';


describe('shared / util - elements', function() {

  describe('#selfAndAllFlowElements', function() {

    const task1 = { id: 'Task_1' },
          task2 = { id: 'Task_2' },
          subProcess = { id: 'SubProcess_1', flowElements: [ task2 ] },
          process = { id: 'Process_1', flowElements: [ task1, subProcess ] };


    it('should return self and all flow elements', function() {

      // when
      const elements = selfAndAllFlowElements([ process ], false);

      // then
      expect(elements).to.eql([ process, task1, subProcess, task2 ]);
    });


    it('should not return duplicates', function() {

      // when
      const elements = selfAndAllFlowElements([ process, process, task1 ], false);

      // then
      expect(elements).to.eql([ process, task1, subProcess, task2 ]);
    });


    it('should return duplicates if allowed', function() {

      // when
      const elements = selfAndAllFlowElements([ process, task1 ], true);

      // then
      expect(elements).to.eql([ process, task1, subProcess, task2, task1 ]);
    });

  });

});
