import { expect } from 'chai';

import { addVariableToList } from '../../../../src/camunda-platform/util/ProcessVariablesUtil.js';

import { createVariablesIndex } from '../../../../src/shared/util/ProcessVariablesUtil.js';


describe('camunda-platform / util - process variables', function() {

  const process = { id: 'Process_1' },
        subProcess = { id: 'SubProcess_1' },
        task1 = { id: 'Task_1' },
        task2 = { id: 'Task_2' },
        task3 = { id: 'Task_3' };


  describe('#addVariableToList', function() {

    let variables, index;

    beforeEach(function() {
      variables = [];
      index = createVariablesIndex(variables);
    });

    function add(variable) {
      addVariableToList(variables, variable, index);
    }


    it('should add variable', function() {

      // given
      const variable = createVariable('foo', process, task1);

      // when
      add(variable);

      // then
      expect(variables).to.have.length(1);
      expect(variables[0]).to.equal(variable);
    });


    it('should merge origins of variables with same name and scope', function() {

      // when
      add(createVariable('foo', process, task1));
      add(createVariable('foo', process, task2));
      add(createVariable('foo', process, task3));

      // then
      expect(toTestable(variables)).to.eql([
        { name: 'foo', origin: [ 'Task_1', 'Task_2', 'Task_3' ], scope: 'Process_1' }
      ]);
    });


    it('should not merge variables with same name and different scope', function() {

      // when
      add(createVariable('foo', process, task1));
      add(createVariable('foo', subProcess, task2));
      add(createVariable('foo', process, task3));

      // then
      expect(toTestable(variables)).to.eql([
        { name: 'foo', origin: [ 'Task_1', 'Task_3' ], scope: 'Process_1' },
        { name: 'foo', origin: [ 'Task_2' ], scope: 'SubProcess_1' }
      ]);
    });


    it('should keep duplicate origin', function() {

      // when
      add(createVariable('foo', process, task1));
      add(createVariable('foo', process, task1));

      // then
      expect(toTestable(variables)).to.eql([
        { name: 'foo', origin: [ 'Task_1', 'Task_1' ], scope: 'Process_1' }
      ]);
    });


    it('should add same variable repeatedly', function() {

      // given
      const variable = createVariable('foo', process, task1);

      // when
      add(variable);
      add(variable);
      add(variable);

      // then
      expect(toTestable(variables)).to.eql([
        { name: 'foo', origin: [ 'Task_1', 'Task_1', 'Task_1', 'Task_1' ], scope: 'Process_1' }
      ]);
    });


    it('should not modify origin of merged variable', function() {

      // given
      const variable = createVariable('foo', process, task1);

      const origin = variable.origin;

      add(variable);

      // when
      add(createVariable('foo', process, task2));

      // then
      expect(origin).to.eql([ task1 ]);
      expect(variable.origin).to.eql([ task1, task2 ]);
    });


    it('should merge into first matching variable of indexed list', function() {

      // given
      variables = [
        createVariable('foo', process, task1),
        createVariable('foo', process, task2)
      ];

      index = createVariablesIndex(variables);

      // when
      add(createVariable('foo', process, task3));

      // then
      expect(toTestable(variables)).to.eql([
        { name: 'foo', origin: [ 'Task_1', 'Task_3' ], scope: 'Process_1' },
        { name: 'foo', origin: [ 'Task_2' ], scope: 'Process_1' }
      ]);
    });


    describe('without index', function() {

      it('should merge into first matching variable', function() {

        // given
        const variables = [
          createVariable('foo', process, task1),
          createVariable('foo', process, task2)
        ];

        // when
        addVariableToList(variables, createVariable('foo', process, task3));

        // then
        expect(toTestable(variables)).to.eql([
          { name: 'foo', origin: [ 'Task_1', 'Task_3' ], scope: 'Process_1' },
          { name: 'foo', origin: [ 'Task_2' ], scope: 'Process_1' }
        ]);
      });


      it('should keep duplicate origin', function() {

        // given
        const variables = [];

        // when
        addVariableToList(variables, createVariable('foo', process, task1));
        addVariableToList(variables, createVariable('foo', process, task1));

        // then
        expect(toTestable(variables)).to.eql([
          { name: 'foo', origin: [ 'Task_1', 'Task_1' ], scope: 'Process_1' }
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

function toTestable(variables) {
  return variables.map(variable => ({
    name: variable.name,
    origin: variable.origin.map(element => element.id),
    scope: variable.scope.id
  }));
}
