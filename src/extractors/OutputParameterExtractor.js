import { forEach, isArray } from 'min-dash';

import inherits from 'inherits';

import BaseExtractor from './BaseExtractor';

import { getOutputParameters } from '../util/ExtensionElementsUtil';

import { createProcessVariable, addVariableToList } from '../util/ProcessVariablesUtil';


export default function OutputParameterExtractor() {
  BaseExtractor.call(this);
}

OutputParameterExtractor.extractVariables = function(options) {
  var elements = options.elements,
      containerElement = options.containerElement,
      processVariables = options.processVariables;

  if (!isArray(elements)) {
    elements = [ elements ];
  }

  forEach(elements, function(element) {

    // variables are created by output parameters
    var outputParameters = getOutputParameters(element);

    // extract all variables with correct scope
    forEach(outputParameters, function(parameter) {
      var newVariable = createProcessVariable(
        element,
        parameter.name,
        containerElement
      );

      addVariableToList(processVariables, newVariable);
    });
  });

  return processVariables;
};

inherits(OutputParameterExtractor, BaseExtractor);

