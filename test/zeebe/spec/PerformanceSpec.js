import { expect } from 'chai';

import { getProcessVariables } from '@bpmn-io/extract-process-variables/zeebe';

import { getRootElement, parseXML } from '../TestHelper.js';

/**
 * Upper bound for extracting variables from 1,000 tasks with 20,000 mappings.
 *
 * Linear extraction takes ~15 ms, quadratic extraction ~3.5 s.
 */
const THRESHOLD = 300;


describe('zeebe / performance', function() {

  this.timeout(30000);


  it('should extract variables from large diagram', async function() {

    // given
    const rootElement = getRootElement(await parseXML(generateDiagram(1000)));

    // when
    const start = performance.now();

    const variables = await getProcessVariables(rootElement);

    const duration = performance.now() - start;

    // then
    expect(variables).to.have.length(15015);
    expect(duration).to.be.below(THRESHOLD);
  });

});


// helpers //////////

/**
 * Generate a diagram with 20 variable mappings per task. Half of the tasks
 * are placed in the process, the other half in sub-processes of 50 tasks.
 *
 * Every task declares 10 local inputs, 5 outputs with names unique to the
 * task and 5 outputs with names shared by all tasks. Every sub-process
 * declares an input for one of the shared names, scoping it locally.
 *
 * @param {number} tasks
 *
 * @return {string} XML
 */
function generateDiagram(tasks) {
  const flowElements = [];

  let id = 0;

  function task() {
    const taskId = id++;

    const mappings = range(10).map(j => input(`in_${ j }`)).concat(
      range(10).map(j => output(j < 5 ? `out_${ taskId }_${ j }` : `shared_${ j }`))
    );

    return `
      <bpmn:serviceTask id="Task_${ taskId }">
        <bpmn:extensionElements>
          <zeebe:ioMapping>${ mappings.join('') }</zeebe:ioMapping>
        </bpmn:extensionElements>
      </bpmn:serviceTask>`;
  }

  while (id < tasks / 2) {
    flowElements.push(task());
  }

  for (let s = 0; id < tasks; s++) {
    const subProcessTasks = [];

    while (id < tasks && subProcessTasks.length < 50) {
      subProcessTasks.push(task());
    }

    flowElements.push(`
      <bpmn:subProcess id="SubProcess_${ s }">
        <bpmn:extensionElements>
          <zeebe:ioMapping>${ input('shared_9') }</zeebe:ioMapping>
        </bpmn:extensionElements>
        ${ subProcessTasks.join('') }
      </bpmn:subProcess>`);
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
    <bpmn:definitions
        xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL"
        xmlns:zeebe="http://camunda.org/schema/zeebe/1.0"
        id="Definitions_1"
        targetNamespace="http://bpmn.io/schema/bpmn">
      <bpmn:process id="Process_1" isExecutable="true">
        ${ flowElements.join('') }
      </bpmn:process>
    </bpmn:definitions>`;
}

function range(n) {
  return Array.from({ length: n }, (_, i) => i);
}

function input(target) {
  return `<zeebe:input source="=a" target="${ target }" />`;
}

function output(target) {
  return `<zeebe:output source="=a" target="${ target }" />`;
}
