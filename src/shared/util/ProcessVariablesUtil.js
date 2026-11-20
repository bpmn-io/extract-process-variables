/**
 * Per list index of process variables, keyed by scope and name.
 *
 * Allows to look up an existing variable in constant time, so that
 * extracting variables scales linearly with the number of variables.
 *
 * @type {WeakMap<Array<ProcessVariable>, VariablesIndex>}
 */
const indexes = new WeakMap();

/**
 * @typedef {Object} VariablesIndex
 * @property {Map<ModdleElement, Map<string, IndexEntry>>} entries
 * @property {number} length number of list items indexed
 *
 * @typedef {Object} IndexEntry
 * @property {ProcessVariable} variable
 * @property {Array<ModdleElement>} [origin] origin array owned by the index
 * @property {Set<ModdleElement>} [originSet] elements in `origin`
 */

/**
 * Add a variable to the list. If a variable with the same name and scope
 * exists already, merge the origin of the new variable into it instead.
 *
 * @param {Array<ProcessVariable>} variablesList
 * @param {ProcessVariable} newVariable
 * @param {Object} [options]
 * @param {boolean} [options.uniqueOrigin=false] whether to skip origins
 *   that the existing variable already lists
 */
export function addVariableToList(variablesList, newVariable, options = {}) {
  const index = getIndex(variablesList);

  const entry = getEntry(index, newVariable);

  if (entry) {
    mergeOrigin(entry, newVariable.origin, options.uniqueOrigin);
  } else {
    variablesList.push(newVariable);

    addEntry(index, newVariable);

    index.length++;
  }
}


// helpers ////////////////////

/**
 * Get the index for a list, catching up on variables
 * that were added to the list directly.
 *
 * @param {Array<ProcessVariable>} variablesList
 *
 * @return {VariablesIndex}
 */
function getIndex(variablesList) {
  let index = indexes.get(variablesList);

  // create index, or re-build it if the list shrank
  if (!index || index.length > variablesList.length) {
    index = {
      entries: new Map(),
      length: 0
    };

    indexes.set(variablesList, index);
  }

  while (index.length < variablesList.length) {
    const variable = variablesList[ index.length++ ];

    // first match wins, as with a linear search
    if (!getEntry(index, variable)) {
      addEntry(index, variable);
    }
  }

  return index;
}

/**
 * @param {VariablesIndex} index
 * @param {ProcessVariable} variable
 *
 * @return {IndexEntry|undefined}
 */
function getEntry(index, variable) {
  const scopeEntries = index.entries.get(variable.scope);

  return scopeEntries && scopeEntries.get(variable.name);
}

/**
 * @param {VariablesIndex} index
 * @param {ProcessVariable} variable
 */
function addEntry(index, variable) {
  let scopeEntries = index.entries.get(variable.scope);

  if (!scopeEntries) {
    scopeEntries = new Map();

    index.entries.set(variable.scope, scopeEntries);
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
