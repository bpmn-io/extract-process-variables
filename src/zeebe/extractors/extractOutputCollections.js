import { forEach, isArray } from 'min-dash';
import { getMultiInstanceOutputCollection, getAdHocOutputCollection } from '../util/ExtensionElementsUtil.js';

import { createProcessVariable, addVariableToList } from '../util/ProcessVariablesUtil.js';

/**
 * Retrieves process variables defined in multi-instance output collection, e.g.
 *
 * <bpmn:serviceTask id="ServiceTask">
 *   <bpmn:multiInstanceLoopCharacteristics>
 *     <bpmn:extensionElements>
 *       <zeebe:loopCharacteristics inputElement="inputElement" outputCollection="outputCollection" />
 *     </bpmn:extensionElements>
 *   </bpmn:multiInstanceLoopCharacteristics>
 * </bpmn:serviceTask>
 *
 * => Adds one variable "outputCollection" to the list.
 *
 * Retrieves variables defined in adHoc output collection, e.g.
 *
 * <bpmn:adHocSubProcess id="AdHocSubProcess">
 *   <bpmn:extensionElements>
 *     <zeebe:adHoc outputCollection="executionResults" outputElement="executionResult" />
 *   </bpmn:extensionElements>
 *   ...
 * </bpmn:adHocSubProcess>
 *
 * => Adds one variable "executionResults" to the list.
 */
export default function extractOutputCollections(options) {
  let elements = options.elements,
      containerElement = options.containerElement,
      processVariables = options.processVariables;

  if (!isArray(elements)) {
    elements = [ elements ];
  }

  // zeebe quirk: <outputCollection> always leaks, despite being a local
  // variable :o)
  //
  forEach(elements, function(element) {

    var multiInstanceOutputCollection = getMultiInstanceOutputCollection(element);

    if (multiInstanceOutputCollection) {
      const newVariable = createProcessVariable(
        element,
        multiInstanceOutputCollection,
        containerElement
      );

      addVariableToList(processVariables, newVariable);
    }

    const adHocOutputCollection = getAdHocOutputCollection(element);

    if (adHocOutputCollection) {

      const newVariable = createProcessVariable(
        element,
        adHocOutputCollection,
        containerElement
      );

      addVariableToList(processVariables, newVariable);
    }
  });

  return processVariables;
}
