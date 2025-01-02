import {
  forEach,
  isArray
} from 'min-dash';

import {
  getErrorEventDefinitions,
  getEscalationEventDefinitions
} from '../util/EventDefinitionsUtil.js';

import {
  createProcessVariable,
  addVariableToList
} from '../util/ProcessVariablesUtil.js';


/**
 * Retrieves process variables defined in event definitions, e.g.
 *
 * <bpmn:escalationEventDefinition
 *   id="EscalationEventDefinition_1"
 *   escalationRef="Escalation_1"
 *   camunda:escalationCodeVariable="variable1"
 * />
 *
 * => Adds one variable "variable1" to the list.
 *
 * <bpmn:errorEventDefinition
 *   id="ErrorEventDefinition_1"
 *   errorRef="Error_1"
 *   camunda:errorCodeVariable="variable2"
 *   camunda:errorMessageVariable="variable3"
 * />
 *
 * => Adds two variables "variable2" & "variable3" to the list.
 *
 */
export default function(options) {
  var elements = options.elements,
      containerElement = options.containerElement,
      processVariables = options.processVariables;

  var addVariable = function(element, name) {
    var newVariable = createProcessVariable(
      element,
      name,
      containerElement
    );

    addVariableToList(processVariables, newVariable);
  };

  if (!isArray(elements)) {
    elements = [ elements ];
  }

  forEach(elements, function(element) {

    // (1) error event code + message variable
    var errorEventDefinitions = getErrorEventDefinitions(element);

    forEach(errorEventDefinitions, function(definition) {

      var errorCodeVariable = definition.get('errorCodeVariable'),
          errorMessageVariable = definition.get('errorMessageVariable');

      if (errorCodeVariable) {
        addVariable(element, errorCodeVariable);
      }

      if (errorMessageVariable) {
        addVariable(element, errorMessageVariable);
      }
    });

    // (2) escalation code variable
    var escalationEventDefinitions = getEscalationEventDefinitions(element);

    forEach(escalationEventDefinitions, function(definition) {

      var escalationCodeVariable = definition.get('escalationCodeVariable');

      if (escalationCodeVariable) {
        addVariable(element, escalationCodeVariable);
      }
    });

  });

  return processVariables;
}
