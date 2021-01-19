import { forEach, isArray } from 'min-dash';

import { createProcessVariable, addVariableToList } from '../util/ProcessVariablesUtil';

/**
 * Retrieves process variables defined in result variables, e.g.
 *
 * <bpmn:sendTask
 *   id="SendTask_1"
 *   camunda:expression="${myBean.ready}"
 *   camunda:resultVariable="variable1"
 * />
 *
 * => Adds one variable "variable1"to the list.
 *
 */
export default function(options) {
  var elements = options.elements,
      containerElement = options.containerElement,
      processVariables = options.processVariables;

  if (!isArray(elements)) {
    elements = [ elements ];
  }

  forEach(elements, function(element) {

    var resultVariable = getResultVariable(element);

    if (resultVariable) {
      var newVariable = createProcessVariable(
        element,
        resultVariable,
        containerElement
      );

      addVariableToList(processVariables, newVariable);
    }
  });

  return processVariables;
}


// helpers ///////////////////////

function getResultVariable(element) {
  return element.get('camunda:resultVariable');
}