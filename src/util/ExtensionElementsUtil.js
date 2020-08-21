import { filter } from 'min-dash';

/**
 * Get a inputOutput from the business object
 *
 * @param {ModdleElement} element
 *
 * @return {ModdleElement} the inputOutput object
 */
export function getInputOutput(element) {
  return (getElements(element, 'camunda:InputOutput') || [])[0];
}

/**
 * Return all input parameters existing in the business object, and
 * an empty array if none exist.
 *
 * @param  {ModdleElement} element
 *
 * @return {Array<ModdleElement>} a list of input parameter objects
 */
export function getInputParameters(element) {
  return getParameters(element, 'inputParameters');
}

/**
 * Return all output parameters existing in the business object, and
 * an empty array if none exist.
 *
 * @param  {ModdleElement} element
 * @param  {boolean} insideConnector
 *
 * @return {Array<ModdleElement>} a list of output parameter objects
 */
export function getOutputParameters(element) {
  return getParameters(element, 'outputParameters');
}

/**
 * Return all form fields existing in the business object, and
 * an empty array if none exist.
 *
 * @param {ModdleElement} element
 *
 * @return {Array<ModdleElement>} a list of form fields
 */
export function getFormFields(element) {
  var formData = getFormData(element);
  return (formData && formData.get('fields')) || [];
}

/**
 * Return form data existing in the business object
 *
 * @param {ModdleElement} element
 *
 * @return {ModdleElement}
 */
export function getFormData(element) {
  return (getElements(element, 'camunda:FormData') || [])[0];
}

/**
 * Return out mappings existing in the business object
 *
 * @param {ModdleElement} element
 *
 * @return {Array<ModdleElement>}
 */
export function getOutMappings(element) {
  return getElements(element, 'camunda:Out') || [];
}


// helpers //////////

function getElements(element, type, property) {
  var elements = getExtensionElements(element, type) || [];

  return !property ? elements : (elements[0] || {})[property] || [];
}

function getParameters(element, property) {
  var inputOutput = getInputOutput(element);

  return (inputOutput && inputOutput.get(property)) || [];
}

function getExtensionElements(element, type) {
  var extensionElements = element.get('extensionElements');

  if (typeof extensionElements !== 'undefined') {
    var extensionValues = extensionElements.get('values');

    if (typeof extensionValues !== 'undefined') {
      var elements = filter(extensionValues, function(value) {
        return is(value, type);
      });

      if (elements.length) {
        return elements;
      }
    }
  }
}

function is(element, type) {
  return (
    element &&
    typeof element.$instanceOf === 'function' &&
    element.$instanceOf(type)
  );
}
