import { forEach, isArray } from 'min-dash';

import { getFormFields } from '../util/ExtensionElementsUtil';

import { createProcessVariable, addVariableToList } from '../util/ProcessVariablesUtil';


/**
 * Retrieves process variables defined in form fields, e.g.
 *
 * <camunda:formData>
 *   <camunda:formField id="variable1" />
 *   <camunda:formField id="variable2" />
 * </camunda:formData>
 *
 * => Adds two variables "variable1" & "variable2" to the list.
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
