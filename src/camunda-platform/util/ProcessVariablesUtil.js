import { find, findIndex } from 'min-dash';

import { getInputParameters } from './ExtensionElementsUtil.js';

import { getParents } from '../../shared/util/ElementsUtil.js';

export function addVariableToList(variablesList, newVariable) {
  var foundIdx = findIndex(variablesList, function(variable) {
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
 * Set parent container if it defines it's own scope for the variable, so
 * when it defines an input mapping for it. Otherwise returns the default global scope
 */
export function getScope(element, globalScope, variableName, includeSelf) {
  var parents = getParents(element, includeSelf);

  // local variables are created through an input mapping
  //
  // find the closes scope parent that defines the input mapping
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

function combineArrays(a, b) {
  return a.concat(b);
}