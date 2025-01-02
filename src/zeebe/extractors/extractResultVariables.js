import { forEach, isArray } from 'min-dash';
import { getCalledDecision, getScript } from '../util/ExtensionElementsUtil.js';

import { createProcessVariable, addVariableToList } from '../util/ProcessVariablesUtil.js';

/**
 * Retrieves process variables defined in result variables, e.g.
 *
 *   <bpmn:businessRuleTask id="Activity_1">
 *     <bpmn:extensionElements>
 *       <zeebe:calledDecision resultVariable="variable1" />
 *     </bpmn:extensionElements>
 *   </bpmn:businessRuleTask>
 *
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

    var baseElement = getCalledDecision(element) ||
                      getScript(element);

    if (!baseElement) {
      return;
    }

    var resultVariable = baseElement.resultVariable;

    // Checks if output variable exists, the scope gets redefined
    if (processVariables.some(x => x.origin[0] === element && x.scope === containerElement)) {

      // result variable will have local scope
      containerElement = element;

      // check if the output have same name as resultVariable, only proceed with output variable
      if (processVariables.some(variable => variable.name === resultVariable)) {
        return processVariables;
      }

    }

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
