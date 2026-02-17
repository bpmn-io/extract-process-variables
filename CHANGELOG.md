# Changelog

All notable changes to [@bpmn-io/extract-process-variables](https://github.com/bpmn-io/extract-process-variables) are documented here. We use [semantic versioning](http://semver.org/) for releases.

## Unreleased

___Note:__ Yet to be released changes appear here._

## 2.1.0

* `FEAT`: extract variables from `<zeebe:adHoc />` declaration

## 2.0.0

* `DEPS`: update to `min-dash@5.0.0`
* `CHORE`: turn into ES module

### Breaking changes

* Drop CJS distribution, consume from CommonJS in Node >= 20.12

## 1.0.1

* `FIX`: correct script task output mapping ([#30](https://github.com/bpmn-io/extract-process-variables/pull/30))

## 1.0.0

_Major release for stable versioning._

## 0.9.0

* `FEAT`: publish ES module version of this library ([#27](https://github.com/bpmn-io/extract-process-variables/issues/27))

## 0.8.0

* `FEAT`: add support for `zeebe:script` ([#25](https://github.com/bpmn-io/extract-process-variables/issues/25))

## 0.7.0

* `FEAT`: allow additional extractors ([#23](https://github.com/bpmn-io/extract-process-variables/pull/23))
* `FEAT`: make extraction asynchronous ([#24](https://github.com/bpmn-io/extract-process-variables/pull/24))

### BREAKING CHANGES

The `extractVariables` API is now asynchronous and returns a `Promise`.

## 0.6.0

* `deps`: update to `min-dash@4`

## 0.5.1

_Republish of 0.5.0 with backwards compatible folder structure_

## 0.5.0

* `FEAT`: add support for Camunda Platform 8 diagrams ([#20](https://github.com/bpmn-io/extract-process-variables/pull/20))

## 0.4.5

* `DEPS`: drop unnecessary peer dependency entirely ([`2f225d33`](https://github.com/bpmn-io/extract-process-variables/commit/2f225d33b5b5ddf8c29f46d71d13986d4e710e08))
* `DEPS`: update to `min-dash@3.8.1`

## 0.4.4

* `DEPS`: update `camunda-bpmn-moddle` peer dependency ([`7c5d8e42`](https://github.com/bpmn-io/extract-process-variables/commit/7c5d8e4220764b1a7312b76b5128bfe3442387fc2))

## 0.4.3

* `FIX`: fix peer dependency ([`570ad7de`](https://github.com/bpmn-io/extract-process-variables/commit/570ad7de08b6d6f9a503628e8cc9f08e10d6b4e2))

## 0.4.2

* `CHORE`: bump `camunda-bpmn-moddle` peer dependency ([`2759f174`](https://github.com/bpmn-io/extract-process-variables/commit/2759f174c2790b93dd98e1688337000dbb61c61c))

## 0.4.1

* `CHORE`: retrieve event definitions directly without getter ([`90a5f6b9`](https://github.com/bpmn-io/extract-process-variables/commit/90a5f6b99d0ef9a79705b4b487d307e2667b38d4))

## 0.4.0

* `FEAT`: add support for event definition variables ([#9](https://github.com/bpmn-io/extract-process-variables/issues/9))
* `CHORE`: migrate to GitHub actions

## 0.3.0

* `FEAT`: add support for `camunda:resultVariable`, `camunda:formField` & `camunda:out` ([#3](https://github.com/bpmn-io/extract-process-variables/issues/3))

## 0.2.0

* `FEAT`: return full moddle elements instead of only ids ([#2](https://github.com/bpmn-io/extract-process-variables/pull/2))
* `CHORE`: avoid using `const` and `let`

## 0.1.0

* `FEAT`: initial version
