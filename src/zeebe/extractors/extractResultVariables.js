import { forEach, isArray } from 'min-dash';
import { getCalledDecision, getOutputMappings, getScript } from '../util/ExtensionElementsUtil.js';

import { createProcessVariable, addVariableToList } from '../util/ProcessVariablesUtil.js';

/**
 * Extracts process variables from extension elements that have a result
 * variable, e.g. given the following element:
 *
 * <bpmn:businessRuleTask id="Task_1">
 *   <bpmn:extensionElements>
 *     <zeebe:calledDecision resultVariable="foo" />
 *   </bpmn:extensionElements>
 * </bpmn:businessRuleTask>
 *
 * a process variable with name 'foo' is extracted.
 *
 * If output variables exist, the scope is set to the element.
 *
 * If an output variable with the same name exists, e.g. given the following
 * element:
 *
 * <bpmn:businessRuleTask id="Task_1">
 *   <bpmn:extensionElements>
 *     <zeebe:calledDecision resultVariable="foo" />
 *     <zeebe:ioMapping>
 *       <zeebe:output target="foo" />
 *     </zeebe:ioMapping>
 *   </bpmn:extensionElements>
 * </bpmn:businessRuleTask>
 *
 * no process variable is created.
 *
 * @param {Object} options
 * @param {Array<ModdleElement>} options.elements
 * @param {ModdleElement} options.containerElement
 * @param {Array<ProcessVariable>} options.processVariables
 *
 * @return {Array<ProcessVariable>}
 */
export default function extractResultVariables(options) {
  var elements = options.elements,
      containerElement = options.containerElement,
      processVariables = options.processVariables;

  if (!isArray(elements)) {
    elements = [ elements ];
  }

  forEach(elements, function(element) {

    var extensionElement = getCalledDecision(element) || getScript(element);

    if (!extensionElement) {
      return;
    }

    var resultVariable = extensionElement.resultVariable;

    if (hasOutMappings(element)) {
      containerElement = element;
    }

    if (resultVariable) {
      var newVariable = createProcessVariable(
        element,
        resultVariable,
        containerElement,
        true
      );

      addVariableToList(processVariables, newVariable);
    }
  });

  return processVariables;
}

function hasOutMappings(element) {
  var outMappings = getOutputMappings(element);

  return outMappings && outMappings.length;
}