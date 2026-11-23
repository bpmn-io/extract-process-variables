import { find } from 'min-dash';

import { getInputParameters } from './ExtensionElementsUtil.js';

import { getParents } from '../../shared/util/ElementsUtil.js';

import { addVariableToList as addVariable } from '../../shared/util/ProcessVariablesUtil.js';

/**
 * Add a variable to the list, or merge its origin into the existing
 * variable with the same name and scope.
 *
 * @param {Array<ProcessVariable>} variablesList
 * @param {ProcessVariable} newVariable
 * @param {VariablesIndex} [index] index of `variablesList`
 */
export function addVariableToList(variablesList, newVariable, index) {
  addVariable(variablesList, newVariable, { index });
}

/**
 * Creates new process variable definition object
 * Identifies correct (highest) scope, in which variable is available
 *
 * @param {ModdleElement} flowElement
 * @param {String} name
 * @param {ModdleElement} defaultScope
 * @param {boolean} [targetSelf=false]
 *
 * @returns {ProcessVariable}
 */
export function createProcessVariable(flowElement, name, defaultScope, targetSelf = false) {
  var scope = getScope(flowElement, defaultScope, name, targetSelf);

  return {
    name: name,
    origin: [ flowElement ],
    scope: scope
  };
}


// helpers ////////////////////


/**
 * Determines the scope of a given variable, by examining the element
 * and its parents. If no scope can be determined, return a specified
 * global scope.
 *
 * @param {ModdleElement} element
 * @param {ModdleElement} globalScope
 * @param {string} variableName
 * @param {boolean} [includeSelf=false]
 *
 * @return {ModdleElement} scope for the variable
 */
export function getScope(element, globalScope, variableName, includeSelf = false) {
  var parents = getParents(element, includeSelf);

  // local variables are created through an input mapping
  //
  // find the closest scope parent that defines the input mapping
  // matching a given variable, that is the scope
  var scopedParent = find(parents, function(parent) {
    return (
      hasInputParameter(parent, variableName)
    );
  });

  return scopedParent ? scopedParent : globalScope;
}

function hasInputParameter(element, name) {
  return find(getInputParameters(element), function(input) {
    return input.name === name;
  });
}
