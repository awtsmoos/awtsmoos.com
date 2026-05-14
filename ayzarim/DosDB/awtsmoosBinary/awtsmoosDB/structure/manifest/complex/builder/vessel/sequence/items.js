
// B"H

/**
 * @file structure/manifest/complex/builder/vessel/sequence/items.js
 * @chapter The River Learns Its Drops
 * @description
 * Converts array-like and set-like values into an ordered item list.
 */

/**
 * @function toItems
 * @description
 * Extracts values from Array or Set.
 *
 * @param {*} val - Source collection.
 * @returns {Array<*>} Items.
 */
function toItems(val) {
  if (Array.isArray(val)) return val;
  if (val instanceof Set) return Array.from(val.values());
  return [];
}

module.exports = toItems;
