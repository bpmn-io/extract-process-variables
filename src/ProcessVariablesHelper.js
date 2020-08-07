import { find, findIndex, forEach } from 'min-dash';

import { selfAndAllFlowElements, getParents } from './util/ElementsUtil';

import {
  getInputParameters,
  getOutputParameters,
} from './util/InputOutputUtil';

/**
 * @typedef {Object} ProcessVariable
 * @property {string} name
 * @property {Array<string>} origin
 * @property {string} scope
 */

/**
 * Creates new process variable definition object
 * Identifies correct (highest) scope, in which variable is available
 *
 * @param {ModdleElement} flowElement
 * @param {ModdleElement} outputParameter
 * @param {String} defaultScope
 *
 * @returns {ProcessVariable}
 */
function createProcessVariable(flowElement, outputParameter, defaultScope) {
  const scope = getScope(flowElement, defaultScope, outputParameter.name);

  return {
    name: outputParameter.name,
    origin: [flowElement.id],
    scope: scope,
  };
}

// api /////////////////////////

/**
 * Retrieves all process variables for a given container element.
 * @param {ModdleElement} containerElement
 *
 * @returns {Array<ProcessVariable>}
 */
export function getProcessVariables(containerElement) {
  let processVariables = [];

  // (1) extract all flow elements inside the container
  const elements = selfAndAllFlowElements([containerElement], false);

  // (2) extract all output parameters inside the container
  forEach(elements, function(element) {

    // variables are created by output parameters
    const outputParameters = getOutputParameters(element);

    // (3) extract all variables with correct scope
    forEach(outputParameters, function(parameter) {
      const newVariable = createProcessVariable(
        element,
        parameter,
        containerElement.id
      );

      addVariableToList(processVariables, newVariable);
    });
  });

  return processVariables;
}

// helpers ////////////////////

/**
 * Set parent container if it defines it's own scope for the variable, so
 * when it defines an input mapping for it. Otherwise returns the default global scope
 */
function getScope(element, globalScope, variableName) {
  const parents = getParents(element);

  const scopedParent = find(parents, function(parent) {
    return (
      is(parent, 'bpmn:SubProcess') && hasInputParameter(parent, variableName)
    );
  });

  return scopedParent ? scopedParent.id : globalScope;
}

function combineArrays(a, b) {
  return a.concat(b);
}

function is(element, type) {
  return (
    element &&
    typeof element.$instanceOf === 'function' &&
    element.$instanceOf(type)
  );
}

function hasInputParameter(element, name) {
  return find(getInputParameters(element), function(input) {
    return input.name === name;
  });
}

function addVariableToList(variablesList, newVariable) {
  const foundIdx = findIndex(variablesList, function(variable) {
    return (
      variable.name === newVariable.name && variable.scope === newVariable.scope
    );
  });

  if (foundIdx >= 0) {
    variablesList[foundIdx].origin = combineArrays(
      variablesList[foundIdx].origin,
      newVariable.origin
    );
  } else {
    variablesList.push(newVariable);
  }
}
