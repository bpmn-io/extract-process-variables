export default function BaseExtractor() {

}

BaseExtractor.prototype.extractVariables = function() {
  throw new Error('#extractVariables has to implemented.');
};