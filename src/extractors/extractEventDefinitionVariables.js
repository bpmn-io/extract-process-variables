import {
  forEach,
  isArray
} from 'min-dash';

import {
  getErrorEventDefinitions,
  getEscalationEventDefinitions
} from '../util/EventDefinitionsUtil';

import {
  createProcessVariable,
  addVariableToList
} from '../util/ProcessVariablesUtil';


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
