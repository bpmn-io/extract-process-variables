import { forEach, isArray } from 'min-dash';

import inherits from 'inherits';

import BaseExtractor from './BaseExtractor';

import { getOutMappings } from '../util/ExtensionElementsUtil';

import { createProcessVariable, addVariableToList } from '../util/ProcessVariablesUtil';


export default function CallActivityOutExtractor() {
  BaseExtractor.call(this);
}

CallActivityOutExtractor.extractVariables = function(options) {
  var elements = options.elements,
      containerElement = options.containerElement,
      processVariables = options.processVariables;

  if (!isArray(elements)) {
    elements = [ elements ];
  }

  forEach(elements, function(element) {

    var outMappings = getOutMappings(element);

    // extract all variables with correct scope
    forEach(outMappings, function(mapping) {

      // do not use variables marked as <local>
      if (mapping.local) {
        return;
      }

      var newVariable = createProcessVariable(
        element,
        mapping.target,
        containerElement
      );

      addVariableToList(processVariables, newVariable);
    });
  });

  return processVariables;
};

inherits(CallActivityOutExtractor, BaseExtractor);

