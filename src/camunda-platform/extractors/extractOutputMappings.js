import { forEach, isArray } from 'min-dash';

import { getOutputMappings } from '../util/ExtensionElementsUtil.js';

import { createProcessVariable, addVariableToList } from '../util/ProcessVariablesUtil.js';


/**
 * Retrieves process variables defined in output mappings and
 * ignores local variables, e.g.
 *
 * <bpmn:extensionElements>
 *   <camunda:out sourceExpression="${myBean.ready}" target="variable1" />
 *   <camunda:out source="foo" target="variableLocal" local="true" />
 * </bpmn:extensionElements>
 *
 * => Adds one variable "variable1" to the list.
 *
 */
export default function extractOutputMappings(options) {
  var elements = options.elements,
      containerElement = options.containerElement,
      processVariables = options.processVariables;

  if (!isArray(elements)) {
    elements = [ elements ];
  }

  forEach(elements, function(element) {

    var outMappings = getOutputMappings(element);

    // extract all variables with correct scope
    forEach(outMappings, function(mapping) {

      // do not use variables marked as <local>
      if (mapping.local) {
        return;
      }

      var newVariable = createProcessVariable(
        element,
        mapping.target,
        containerElement
      );

      addVariableToList(processVariables, newVariable);
    });
  });

  return processVariables;
}
