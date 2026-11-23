/**
 * Index of process variables, keyed by scope and name.
 *
 * Allows to look up an existing variable in constant time, so that
 * extracting variables scales linearly with the number of variables.
 *
 * @typedef {Map<ModdleElement, Map<string, IndexEntry>>} VariablesIndex
 *
 * @typedef {Object} IndexEntry
 * @property {ProcessVariable} variable
 * @property {Array<ModdleElement>} [origin] origin array owned by the index
 * @property {Set<ModdleElement>} [originSet] elements in `origin`
 */

/**
 * Create an index for a list of variables.
 *
 * The index stays in sync with the list as long as variables
 * are added to the list via `addVariableToList` only.
 *
 * @param {Array<ProcessVariable>} [variablesList=[]]
 *
 * @return {VariablesIndex}
 */
export function createVariablesIndex(variablesList = []) {
  const index = new Map();

  for (const variable of variablesList) {

    // first match wins, as with a linear search
    if (!getEntry(index, variable)) {
      addEntry(index, variable);
    }
  }

  return index;
}

/**
 * Add a variable to the list. If a variable with the same name and scope
 * exists already, merge the origin of the new variable into it instead.
 *
 * @param {Array<ProcessVariable>} variablesList
 * @param {ProcessVariable} newVariable
 * @param {Object} [options]
 * @param {VariablesIndex} [options.index] index of `variablesList`;
 *   the list is indexed on every call if not provided
 * @param {boolean} [options.uniqueOrigin=false] whether to skip origins
 *   that the existing variable already lists
 */
export function addVariableToList(variablesList, newVariable, options = {}) {
  const {
    index = createVariablesIndex(variablesList),
    uniqueOrigin = false
  } = options;

  const entry = getEntry(index, newVariable);

  if (entry) {
    mergeOrigin(entry, newVariable.origin, uniqueOrigin);
  } else {
    variablesList.push(newVariable);

    addEntry(index, newVariable);
  }
}


// helpers ////////////////////

/**
 * @param {VariablesIndex} index
 * @param {ProcessVariable} variable
 *
 * @return {IndexEntry|undefined}
 */
function getEntry(index, variable) {
  const scopeEntries = index.get(variable.scope);

  return scopeEntries && scopeEntries.get(variable.name);
}

/**
 * @param {VariablesIndex} index
 * @param {ProcessVariable} variable
 */
function addEntry(index, variable) {
  let scopeEntries = index.get(variable.scope);

  if (!scopeEntries) {
    scopeEntries = new Map();

    index.set(variable.scope, scopeEntries);
  }

  scopeEntries.set(variable.name, { variable });
}

/**
 * Merge origins into the variable of an index entry.
 *
 * The variable's origin array is copied once, on first merge,
 * and appended to afterwards.
 *
 * @param {IndexEntry} entry
 * @param {Array<ModdleElement>} origin
 * @param {boolean} [unique=false]
 */
function mergeOrigin(entry, origin, unique = false) {
  const variable = entry.variable;

  if (variable.origin !== entry.origin) {
    entry.origin = variable.origin = [ ...(variable.origin || []) ];
    entry.originSet = new Set(entry.origin);
  }

  // copy, as `origin` is the array appended to
  // if the same variable is added repeatedly
  for (const element of [ ...(origin || []) ]) {
    if (unique && entry.originSet.has(element)) {
      continue;
    }

    entry.originSet.add(element);
    entry.origin.push(element);
  }
}
