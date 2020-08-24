import { forEach, isArray } from 'min-dash';

import { createProcessVariable, addVariableToList } from '../util/ProcessVariablesUtil';

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