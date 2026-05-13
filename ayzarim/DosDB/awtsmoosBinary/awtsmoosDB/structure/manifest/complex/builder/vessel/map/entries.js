
// B"H

/**
 * @file structure/manifest/complex/builder/vessel/map/entries.js
 * @chapter The Sorted Pairs Assemble
 * @description
 * Native Map values carry entries.
 * Awtsmoos marker Maps carry object keys.
 * This module normalizes both into pairs.
 */

/**
 * @function toEntries
 * @description
 * Converts Map-like input into key/value pairs.
 *
 * @param {*} val - Source value.
 * @returns {Array<[string, *]>} Entries.
 */
function toEntries(val) {
  if (val instanceof Map) {
    return Array.from(val.entries()).map(pair => [String(pair[0]), pair[1]]);
  }

  return Object.keys(val)
    .filter(k => !k.startsWith('_isAwtsmoos'))
    .map(k => [k, val[k]]);
}

module.exports = toEntries;
