import { filter, find, forEach } from 'min-dash';

import extractors from './extractors/index.js';

import { selfAndAllFlowElements, getParents, getElement } from '../shared/util/ElementsUtil.js';

export { getScope, createProcessVariable } from './util/ProcessVariablesUtil.js';

/**
 * @typedef {Object} ProcessVariable
 * @property {string} name
 * @property {Array<ModdleElement>} origin
 * @property {ModdleElement} scope
 */


/**
 * Extractors add ProcessVariables to the `options.processVariables` parameter.
 * @callback extractor
 * @param {Object} options
 * @param {Array<ModdleElement>} options.elements
 * @param {ModdleElement} options.containerElement
 * @param {Array<ProcessVariable>} options.processVariables
 */

// api /////////////////////////

/**
 * Retrieves all process variables for a given container element.
 * @param {ModdleElement} containerElement
 * @param {Array<extractor>} additionalExtractors
 *
 * @returns {Promise<Array<ProcessVariable>>}
 */
export function getProcessVariables(containerElement, additionalExtractors = []) {
  const allPromises = [];

  var processVariables = [];

  // (1) extract all flow elements inside the container
  var elements = selfAndAllFlowElements([ containerElement ], false);

  // (2) extract all variables from the extractors
  forEach([ ...extractors, ...additionalExtractors ], function(extractor) {
    allPromises.push(
      extractor({
        elements: elements,
        containerElement: containerElement,
        processVariables: processVariables
      })
    );
  });

  return Promise.all(allPromises)
    .then(() => processVariables);
}

/**
 * Retrieves all variables which are available in the given scope
 *
 * * Exclude variables which are only available in other scopes
 * * Exclude variables which are produced by the given element
 * * Include variables which are available in parent scopes
 *
 * @param {string} scope
 * @param {ModdleElement} rootElement element from where to extract all variables
 * @param {Array<extractor>} additionalExtractors
 *
 * @returns {Promise<Array<ProcessVariable>>}
 */
export async function getVariablesForScope(scope, rootElement, additionalExtractors = []) {

  var allVariables = await getProcessVariables(rootElement, additionalExtractors);

  var scopeElement = getElement(scope, rootElement);

  // (1) get variables for given scope
  var scopeVariables = filter(allVariables, function(variable) {
    return variable.scope.id === scopeElement.id;
  });

  // (2) get variables for parent scopes
  var parents = getParents(scopeElement);

  var parentsScopeVariables = filter(allVariables, function(variable) {
    return find(parents, function(parent) {
      return parent.id === variable.scope.id;
    });
  });

  return combineArrays(scopeVariables, parentsScopeVariables);
}

// helpers ////////////////////

function combineArrays(a, b) {
  return a.concat(b);
}
