import { forEach, isArray } from 'min-dash';
import { getCalledDecision, getScript } from '../util/ExtensionElementsUtil';

import { createProcessVariable, addVariableToList } from '../util/ProcessVariablesUtil';

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
