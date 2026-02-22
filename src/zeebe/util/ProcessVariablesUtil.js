import { find, findIndex } from 'min-dash';

import { getInputMappings, getOutputMappings } from './ExtensionElementsUtil.js';

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

  // (1) if an element defines an output mapping
  // then the variable is local
  if (includeSelf && hasOutputMappings(element)) {
    return element;
  }

  // (2) otherwise, search parents upwards, to determine the closest
  // scope that declares the variable (via a matching input mapping)
  var parents = getParents(element, includeSelf);

  var scopedParent = find(parents, function(parent) {
    return (
      hasInputMapping(parent, variableName)
    );
  });

  return scopedParent ? scopedParent : globalScope;
}

/**
 * Does element define output mappings?
 *
 * @param {ModdleElement} element
 *
 * @return {boolean}
 */
function hasOutputMappings(element) {
  var outputMappings = getOutputMappings(element);

  return outputMappings && outputMappings.length > 0;
}

/**
 * Does element define an input mapping for the given name?
 *
 * @param {ModdleElement} element
 * @param {string} name
 *
 * @return {boolean}
 */
function hasInputMapping(element, name) {
  return find(getInputMappings(element), function(input) {

    // inputs define mappings by name, an input
    // <foo.baz> defines a local variable <foo> with the value <baz>
    // we match if that variable part is either equal or a prefix of name

    const localName = input.target;
    const localPart = localName.split('.')[0];

    // exact match
    if (localName === name) {
      return true;
    }

    // name is hierarchical <foo.bar>, localPart is prefix <foo>
    if (name.startsWith(localPart + '.')) {
      return true;
    }

    return false;
  });
}

/**
 * Combine elements from two arrays, ensuring there are no duplicates.
 *
 * @param {Array} a
 * @param {Array} b
 *
 * @return {Array}
 */
function combineArrays(a, b) {
  const newItems = b.filter(value => !a.includes(value));

  return a.concat(newItems);
}