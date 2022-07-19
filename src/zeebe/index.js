import { filter, find, forEach } from 'min-dash';

import extractors from './extractors';

import { selfAndAllFlowElements, getParents, getElement } from '../shared/util/ElementsUtil';

/**
 * @typedef {Object} ProcessVariable
 * @property {string} name
 * @property {Array<ModdleElement>} origin
 * @property {ModdleElement} scope
 */

// api /////////////////////////

/**
 * Retrieves all process variables for a given container element.
 * @param {ModdleElement} containerElement
 *
 * @returns {Array<ProcessVariable>}
 */
export function getProcessVariables(containerElement) {
  var processVariables = [];

  // (1) extract all flow elements inside the container
  var elements = selfAndAllFlowElements([containerElement], false);

  // (2) extract all variables from the extractors
  forEach(extractors, function(extractor) {
    extractor({
      elements: elements,
      containerElement: containerElement,
      processVariables: processVariables
    });
  });

  return processVariables;
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
 *
 * @returns {Array<ProcessVariable>}
 */
export function getVariablesForScope(scope, rootElement) {

  var allVariables = getProcessVariables(rootElement);

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


export function getVariablesForElement(element) {
  return getVariablesForScope(getScope(element), getRootElement(element));
}

function getScope(element) {
  const bo = getBusinessObject(element);

  if (is(element, 'bpmn:Participant')) {
    return bo.processRef.id;
  }

  return bo.id;
}

function getRootElement(element) {
  const businessObject = getBusinessObject(element);

  if (is(businessObject, 'bpmn:Participant')) {
    return businessObject.processRef;
  }

  if (is(businessObject, 'bpmn:Process')) {
    return businessObject;
  }

  let parent = businessObject;

  while (parent.$parent && !is(parent, 'bpmn:Process')) {
    parent = parent.$parent;
  }

  return parent;
}


// helpers ////////////////////

function combineArrays(a, b) {
  return a.concat(b);
}


function getBusinessObject(element) {
  return (element && element.businessObject) || element;
}


function is(element, type) {
  var bo = getBusinessObject(element);

  return bo && (typeof bo.$instanceOf === 'function') && bo.$instanceOf(type);
}