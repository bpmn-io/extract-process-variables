import { forEach, isArray } from 'min-dash';

import { getFormFields } from '../util/ExtensionElementsUtil';

import { createProcessVariable, addVariableToList } from '../util/ProcessVariablesUtil';


export default function(options) {
  var elements = options.elements,
      containerElement = options.containerElement,
      processVariables = options.processVariables;

  if (!isArray(elements)) {
    elements = [ elements ];
  }

  forEach(elements, function(element) {

    var formFields = getFormFields(element);

    // extract all variables with correct scope
    forEach(formFields, function(field) {
      var newVariable = createProcessVariable(
        element,
        field.id,
        containerElement
      );

      addVariableToList(processVariables, newVariable);
    });
  });

  return processVariables;
}
