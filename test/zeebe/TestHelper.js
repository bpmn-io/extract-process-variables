import { expect } from 'chai';

import { map } from 'min-dash';

import { BpmnModdle } from 'bpmn-moddle';

import ZeebeModdle from 'zeebe-bpmn-moddle/resources/zeebe.json' with { type: 'json' };

import fs from 'node:fs';


export function getRootElement(model) {
  return model.rootElement.get('rootElements')[0];
}

export function getElement(model, id) {

  const element = model.elementsById[id];

  expect(element, `element[id=${id}]`).to.exist;

  return element;
}

export async function parseXML(xml) {
  const moddle = new BpmnModdle({
    zeebe: ZeebeModdle,
  });

  return moddle.fromXML(xml);
}

export function readFile(path, encoding = 'utf8') {
  return fs.readFileSync(path, encoding);
}

export async function readModel(path) {
  const xml = readFile(path);

  return parseXML(xml);
}

export function convertToTestable(variables) {
  return map(variables, function(variable) {
    return {
      name: variable.name,
      origin: map(variable.origin, function(origin) {
        return origin.id;
      }),
      scope: variable.scope.id
    };
  });
}
