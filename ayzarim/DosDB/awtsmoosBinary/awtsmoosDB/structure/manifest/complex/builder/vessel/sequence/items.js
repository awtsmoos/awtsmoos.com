
// B"H

/**
 * @file structure/manifest/complex/builder/vessel/sequence/items.js
 * @chapter The River Learns Its Drops
 * @description
 * Arrays and Sets both become sequence-backed vessels.
 * This module extracts their items without making the manifestor heavy.
 */

/**
 * @function toItems
 * @description
 * Converts array-like collection values into iterable item arrays.
 *
 * @param {*} val - Source collection.
 * @returns {Array<*>} Items to save.
 */
function toItems(val) {
  if (Array.isArray(val)) return val;
  if (val instanceof Set) return Array.from(val.values());
  return [];
}

module.exports = toItems;
