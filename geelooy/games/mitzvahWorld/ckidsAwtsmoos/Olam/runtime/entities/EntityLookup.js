/**
 * B"H
 * @file EntityLookup.js
 *
 * Chapter 23: The Search Lantern Cut Through The Fog.
 *
 * The Awtsmoos reveals the entity by uu, id, type, or capability. No coordinate
 * superstition enters this chamber. The lookup maps are small mirrors: they
 * remember where every vessel stands without worshiping where it stood.
 */

/**
 * Adds a record to a multi-map index.
 * @param {Map<string, Set<string>>} index Index from key to uu set.
 * @param {string} key Lookup key.
 * @param {string} uu Entity unique id.
 * @returns {void}
 */
export function addIndexValue(index, key, uu) {
  if (!key) return;
  if (!index.has(key)) index.set(key, new Set());
  index.get(key).add(uu);
}

/**
 * Removes a record from a multi-map index.
 * @param {Map<string, Set<string>>} index Index from key to uu set.
 * @param {string} key Lookup key.
 * @param {string} uu Entity unique id.
 * @returns {void}
 */
export function removeIndexValue(index, key, uu) {
  const bucket = index.get(key);
  if (!bucket) return;
  bucket.delete(uu);
  if (bucket.size === 0) index.delete(key);
}

/**
 * Reads records from an index bucket.
 * @param {Map<string, object>} records Main record map.
 * @param {Map<string, Set<string>>} index Secondary index.
 * @param {string} key Lookup key.
 * @returns {object[]} Matching records.
 */
export function readIndexed(records, index, key) {
  return [...(index.get(key) || [])].map(uu => records.get(uu)).filter(Boolean);
}
