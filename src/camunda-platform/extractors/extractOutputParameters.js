import { forEach, isArray } from 'min-dash';

import { getOutputParameters } from '../util/ExtensionElementsUtil.js';

import { createProcessVariable, addVariableToList } from '../util/ProcessVariablesUtil.js';


/**
 * Retrieves process variables defined in output parameters, e.g.
 *
 * <camunda:inputOutput>
 *   <camunda:outputParameter name="variable1">200</camunda:outputParameter>
 *   <camunda:outputParameter name="variable2">${myLocalVar + 20}</camunda:outputParameter>
 * </camunda:inputOutput>
 *
 * => Adds two variables "variable1" & "variable2" to the list.
 *
 */
export default function extractOutputParameters(options) {
  var elements = options.elements,
      containerElement = options.containerElement,
      processVariables = options.processVariables;

  if (!isArray(elements)) {
    elements = [ elements ];
  }

  forEach(elements, function(element) {

    // variables are created by output parameters
    var outputParameters = getOutputParameters(element);

    // extract all variables with correct scope
    forEach(outputParameters, function(parameter) {
      var newVariable = createProcessVariable(
        element,
        parameter.name,
        containerElement
      );

      addVariableToList(processVariables, newVariable);
    });
  });

  return processVariables;
}
