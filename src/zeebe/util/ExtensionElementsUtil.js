import { filter } from 'min-dash';


/**
 * Get a inputOutput from the business object
 *
 * @param {ModdleElement} element
 *
 * @return {ModdleElement} the inputOutput object
 */
export function getInputOutput(element) {
  return (getElements(element, 'zeebe:IoMapping') || [])[0];
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
  return getParameters(element, 'output');
}

/**
 * Return output mappings existing in the business object
 *
 * @param {ModdleElement} element
 *
 * @return {Array<ModdleElement>}
 */
export function getOutputMappings(element) {
  return (getInputOutput(element) || {}).outputParameters;
}

/**
 * Return input mappings existing in the business object
 *
 * @param {ModdleElement} element
 *
 * @return {Array<ModdleElement>}
 */
export function getInputMappings(element) {
  return (getInputOutput(element) || {}).inputParameters;
}

/**
 * Get the multi-instance inputElement name from an element
 *
 * @param {MoodleElement} element
 * @returns {string|undefined} inputElement name, if existing
 */
export function getMultiInstanceInputElement(element) {
  const loopCharacteristics = element.loopCharacteristics;

  const extensionElement = loopCharacteristics && getElements(loopCharacteristics, 'zeebe:LoopCharacteristics')[0];

  return extensionElement && extensionElement.inputElement;
}

/**
 * Get the multi-instance outputCollection name from an element
 *
 * @param {MoodleElement} element
 *
 * @returns {string|undefined} outputCollection name, if existing
 */
export function getMultiInstanceOutputCollection(element) {

  const loopCharacteristics = element.loopCharacteristics;

  const extensionElement = loopCharacteristics && getElements(loopCharacteristics, 'zeebe:LoopCharacteristics')[0];

  return extensionElement && extensionElement.outputCollection;
}

/**
 * Get the adHoc outputCollection name from an element
 *
 * @param {MoodleElement} element
 *
 * @returns {string|undefined} outputCollection name, if existing
 */
export function getAdHocOutputCollection(element) {
  const adHoc = getElements(element, 'zeebe:AdHoc')[0];

  return adHoc && adHoc.outputCollection;
}

/**
 * Get a calledDecision from the business object
 *
 * @param {MoodleElement} element
 * @returns {MoodleElement} the calledDecision object
 */
export function getCalledDecision(element) {
  return (getElements(element, 'zeebe:CalledDecision') || [])[0];
}


/**
 * Get a script from the business object
 *
 * @param {MoodleElement} element
 * @returns {MoodleElement} the script object
 */
export function getScript(element) {
  return (getElements(element, 'zeebe:Script') || [])[0];
}

// helpers //////////

function getElements(element, type, property) {
  var elements = getExtensionElements(element, type);

  return !property ? elements : (elements[0] || {})[property] || [];
}

function getParameters(element, property) {
  var inputOutput = getInputOutput(element);

  return (inputOutput && inputOutput.get(property)) || [];
}

function getExtensionElements(element, type) {
  var elements = [];
  var extensionElements = element.get('extensionElements');

  if (typeof extensionElements !== 'undefined') {
    var extensionValues = extensionElements.get('values');

    if (typeof extensionValues !== 'undefined') {
      elements = filter(extensionValues, function(value) {
        return is(value, type);
      });
    }
  }

  return elements;
}

function is(element, type) {
  return (
    element &&
    typeof element.$instanceOf === 'function' &&
    element.$instanceOf(type)
  );
}
