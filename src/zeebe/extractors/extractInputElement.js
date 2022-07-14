import { forEach, isArray } from 'min-dash';
import { getInputElement } from '../util/ExtensionElementsUtil';

import { createProcessVariable, addVariableToList } from '../util/ProcessVariablesUtil';

/**
 * Retrieves process variables defined in result variables, e.g.
 *
 * <bpmn:serviceTask id="ServiceTask">
 *   <bpmn:multiInstanceLoopCharacteristics>
 *     <bpmn:extensionElements>
 *       <zeebe:loopCharacteristics inputElement="inputElement" outputCollection="outputCollection" />
 *     </bpmn:extensionElements>
 *   </bpmn:multiInstanceLoopCharacteristics>
 * </bpmn:serviceTask>
 *
 * => Adds one variable "inputElement"to the list.
 *
 */
export default function(options) {
  var elements = options.elements,
      processVariables = options.processVariables;

  if (!isArray(elements)) {
    elements = [ elements ];
  }

  forEach(elements, function(element) {

    var loopCharacteristics = element.loopCharacteristics;

    var inputElement = loopCharacteristics && getInputElement(loopCharacteristics);

    if (inputElement) {
      var newVariable = createProcessVariable(
        element,
        inputElement,
        element
      );

      addVariableToList(processVariables, newVariable);
    }
  });

  return processVariables;
}
