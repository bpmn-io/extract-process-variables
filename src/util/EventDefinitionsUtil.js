import { filter } from 'min-dash';

/**
 *
 * @param {ModdleElement} element
 * @param {String} [type] - optional
 *
 * @return {Array<ModdleElement>|null} collection of event definitions
 */
export function getEventDefinitions(element, type) {
  var eventDefinitions = element.get('eventDefinitions');

  if (!eventDefinitions || !type) {
    return eventDefinitions;
  }

  return filter(eventDefinitions, function(definition) {
    return is(definition, type);
  });
}

/**
 * Returns error event definitions for a given element.
 *
 * @param {ModdleElement} element
 *
 * @return {Array<ModdleElement>} collection of error event definitions
 */
export function getErrorEventDefinitions(element) {
  return getEventDefinitions(element, 'bpmn:ErrorEventDefinition');
}

/**
 * Returns escalation event definitions for a given element.
 *
 * @param {ModdleElement} element
 *
 * @return {Array<ModdleElement>} collection of escalation event definitions
 */
export function getEscalationEventDefinitions(element) {
  return getEventDefinitions(element, 'bpmn:EscalationEventDefinition');
}


// helper ////////////////

function is(element, type) {
  return (
    element &&
    typeof element.$instanceOf === 'function' &&
    element.$instanceOf(type)
  );
}