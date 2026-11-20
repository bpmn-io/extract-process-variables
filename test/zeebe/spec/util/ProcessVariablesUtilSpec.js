import { expect } from 'chai';

import { addVariableToList } from '../../../../src/zeebe/util/ProcessVariablesUtil.js';

import { convertToTestable } from '../../TestHelper.js';


describe('zeebe / util - process variables', function() {

  const process = { id: 'Process_1' },
        subProcess = { id: 'SubProcess_1' },
        task1 = { id: 'Task_1' },
        task2 = { id: 'Task_2' },
        task3 = { id: 'Task_3' };


  describe('#addVariableToList', function() {

    it('should add variable', function() {

      // given
      const variables = [];

      const variable = createVariable('foo', process, task1);

      // when
      addVariableToList(variables, variable);

      // then
      expect(variables).to.have.length(1);
      expect(variables[0]).to.equal(variable);
    });


    it('should merge origins of variables with same name and scope', function() {

      // given
      const variables = [];

      // when
      addVariableToList(variables, createVariable('foo', process, task1));
      addVariableToList(variables, createVariable('foo', process, task2));
      addVariableToList(variables, createVariable('foo', process, task3));

      // then
      expect(convertToTestable(variables)).to.eql([
        { name: 'foo', origin: [ 'Task_1', 'Task_2', 'Task_3' ], scope: 'Process_1' }
      ]);
    });


    it('should not merge variables with same name and different scope', function() {

      // given
      const variables = [];

      // when
      addVariableToList(variables, createVariable('foo', process, task1));
      addVariableToList(variables, createVariable('foo', subProcess, task2));
      addVariableToList(variables, createVariable('foo', process, task3));

      // then
      expect(convertToTestable(variables)).to.eql([
        { name: 'foo', origin: [ 'Task_1', 'Task_3' ], scope: 'Process_1' },
        { name: 'foo', origin: [ 'Task_2' ], scope: 'SubProcess_1' }
      ]);
    });


    it('should not merge variables with different name and same scope', function() {

      // given
      const variables = [];

      // when
      addVariableToList(variables, createVariable('foo', process, task1));
      addVariableToList(variables, createVariable('bar', process, task1));

      // then
      expect(convertToTestable(variables)).to.eql([
        { name: 'foo', origin: [ 'Task_1' ], scope: 'Process_1' },
        { name: 'bar', origin: [ 'Task_1' ], scope: 'Process_1' }
      ]);
    });


    it('should match scope by identity', function() {

      // given
      const variables = [];

      const otherProcess = { id: 'Process_1' };

      // when
      addVariableToList(variables, createVariable('foo', process, task1));
      addVariableToList(variables, createVariable('foo', otherProcess, task2));

      // then
      expect(variables).to.have.length(2);
      expect(variables[0].scope).to.equal(process);
      expect(variables[1].scope).to.equal(otherProcess);
    });


    it('should not duplicate origin', function() {

      // given
      const variables = [];

      // when
      addVariableToList(variables, createVariable('foo', process, task1));
      addVariableToList(variables, createVariable('foo', process, task2));
      addVariableToList(variables, createVariable('foo', process, task1));

      // then
      expect(convertToTestable(variables)).to.eql([
        { name: 'foo', origin: [ 'Task_1', 'Task_2' ], scope: 'Process_1' }
      ]);
    });


    it('should add same variable repeatedly', function() {

      // given
      const variables = [];

      const variable = createVariable('foo', process, task1);

      // when
      addVariableToList(variables, variable);
      addVariableToList(variables, variable);
      addVariableToList(variables, variable);

      // then
      expect(convertToTestable(variables)).to.eql([
        { name: 'foo', origin: [ 'Task_1' ], scope: 'Process_1' }
      ]);
    });


    it('should not modify origin of merged variable', function() {

      // given
      const variables = [];

      const variable = createVariable('foo', process, task1);

      const origin = variable.origin;

      addVariableToList(variables, variable);

      // when
      addVariableToList(variables, createVariable('foo', process, task2));

      // then
      expect(origin).to.eql([ task1 ]);
      expect(variable.origin).to.eql([ task1, task2 ]);
    });


    describe('list modified externally', function() {

      it('should merge into variable added externally', function() {

        // given
        const variables = [
          createVariable('foo', process, task1)
        ];

        // when
        addVariableToList(variables, createVariable('foo', process, task2));

        // then
        expect(convertToTestable(variables)).to.eql([
          { name: 'foo', origin: [ 'Task_1', 'Task_2' ], scope: 'Process_1' }
        ]);
      });


      it('should merge into variable added externally after indexing', function() {

        // given
        const variables = [];

        addVariableToList(variables, createVariable('foo', process, task1));

        variables.push(createVariable('bar', process, task1));

        // when
        addVariableToList(variables, createVariable('bar', process, task2));

        // then
        expect(convertToTestable(variables)).to.eql([
          { name: 'foo', origin: [ 'Task_1' ], scope: 'Process_1' },
          { name: 'bar', origin: [ 'Task_1', 'Task_2' ], scope: 'Process_1' }
        ]);
      });


      it('should merge into first matching variable', function() {

        // given
        const variables = [
          createVariable('foo', process, task1),
          createVariable('foo', process, task2)
        ];

        // when
        addVariableToList(variables, createVariable('foo', process, task3));

        // then
        expect(convertToTestable(variables)).to.eql([
          { name: 'foo', origin: [ 'Task_1', 'Task_3' ], scope: 'Process_1' },
          { name: 'foo', origin: [ 'Task_2' ], scope: 'Process_1' }
        ]);
      });


      it('should handle variable removed externally', function() {

        // given
        const variables = [];

        addVariableToList(variables, createVariable('foo', process, task1));

        variables.pop();

        // when
        addVariableToList(variables, createVariable('foo', process, task2));

        // then
        expect(convertToTestable(variables)).to.eql([
          { name: 'foo', origin: [ 'Task_2' ], scope: 'Process_1' }
        ]);
      });


      it('should handle origin replaced externally', function() {

        // given
        const variables = [];

        const variable = createVariable('foo', process, task1);

        addVariableToList(variables, variable);
        addVariableToList(variables, createVariable('foo', process, task2));

        variable.origin = [ task3 ];

        // when
        addVariableToList(variables, createVariable('foo', process, task2));

        // then
        expect(convertToTestable(variables)).to.eql([
          { name: 'foo', origin: [ 'Task_3', 'Task_2' ], scope: 'Process_1' }
        ]);
      });

    });

  });

});


// helpers //////////

function createVariable(name, scope, origin) {
  return {
    name,
    origin: [ origin ],
    scope
  };
}
