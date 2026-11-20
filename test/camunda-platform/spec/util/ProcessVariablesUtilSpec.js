import { expect } from 'chai';

import { addVariableToList } from '../../../../src/camunda-platform/util/ProcessVariablesUtil.js';


describe('camunda-platform / util - process variables', function() {

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
      expect(toTestable(variables)).to.eql([
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
      expect(toTestable(variables)).to.eql([
        { name: 'foo', origin: [ 'Task_1', 'Task_3' ], scope: 'Process_1' },
        { name: 'foo', origin: [ 'Task_2' ], scope: 'SubProcess_1' }
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


    it('should add same variable repeatedly', function() {

      // given
      const variables = [];

      const variable = createVariable('foo', process, task1);

      // when
      addVariableToList(variables, variable);
      addVariableToList(variables, variable);
      addVariableToList(variables, variable);

      // then
      expect(toTestable(variables)).to.eql([
        { name: 'foo', origin: [ 'Task_1', 'Task_1', 'Task_1', 'Task_1' ], scope: 'Process_1' }
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


    it('should merge into first matching variable added externally', function() {

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
