import { forEach, isArray } from 'min-dash';

import { getInMappings } from '../util/ExtensionElementsUtil';

import { createProcessVariable, addVariableToList } from '../util/ProcessVariablesUtil';


/**
 * Retrieves process variables defined in output mappings, e.g.
 *
 * <bpmn:serviceTask id="ServiceTask">
 *   <bpmn:extensionElements>
 *     <zeebe:ioMapping>
 *       <zeebe:input source="= source" target="variable1" />
 *     </zeebe:ioMapping>
 *   </bpmn:extensionElements>
 * </bpmn:serviceTask>
 *
 * => Adds one variable "variable1" to the list.
 *
 */
export default function(options) {
  var elements = options.elements,
      processVariables = options.processVariables;

  if (!isArray(elements)) {
    elements = [ elements ];
  }

  forEach(elements, function(element) {

    var inMappings = getInMappings(element);

    // extract all variables with correct scope
    forEach(inMappings, function(mapping) {

      var newVariable = createProcessVariable(
        element,
        mapping.target,
        element
      );

      addVariableToList(processVariables, newVariable);
    });
  });

  return processVariables;
}
