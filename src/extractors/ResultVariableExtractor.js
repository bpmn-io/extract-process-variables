import { forEach, isArray } from 'min-dash';

import inherits from 'inherits';

import BaseExtractor from './BaseExtractor';

import { createProcessVariable, addVariableToList } from '../util/ProcessVariablesUtil';


export default function ResultVariableExtractor() {
  BaseExtractor.call(this);
}

ResultVariableExtractor.extractVariables = function(options) {
  var elements = options.elements,
      containerElement = options.containerElement,
      processVariables = options.processVariables;

  if (!isArray(elements)) {
    elements = [ elements ];
  }

  forEach(elements, function(element) {

    var resultVariable = getResultVariable(element);

    if (resultVariable) {
      var newVariable = createProcessVariable(
        element,
        resultVariable,
        containerElement
      );

      addVariableToList(processVariables, newVariable);
    }
  });

  return processVariables;
};

inherits(ResultVariableExtractor, BaseExtractor);


// helpers ///////////////////////

function getResultVariable(element) {
  return element.get('camunda:resultVariable');
}