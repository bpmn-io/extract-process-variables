import { addVariableToList, createProcessVariable } from './src/processVariableUtils';

export const ExtractProcessVariables = function(eventBus) {
  this._eventBus = eventBus;

  eventBus.on('getExtractors', this.addExtractor.bind(this));
};

ExtractProcessVariables.prototype.addExtractor = function(context) {
  context.extractors.push(this.extractVariables.bind(this));
};

ExtractProcessVariables.prototype.extractVariables = function(context) {

  // To be implemented by subclasses
};

ExtractProcessVariables.prototype.addVariable = function(
    processVariables, flowElement, name, defaultScope, details
) {
  var newVariable = createProcessVariable(flowElement, name, defaultScope, details);

  addVariableToList(processVariables, newVariable);
};

ExtractProcessVariables.prototype.$inject = [ 'eventBus' ];


export default {
  __init__: [ 'extractProcessVariables' ],
  extractProcessVariables: [ 'type', ExtractProcessVariables ]
};
