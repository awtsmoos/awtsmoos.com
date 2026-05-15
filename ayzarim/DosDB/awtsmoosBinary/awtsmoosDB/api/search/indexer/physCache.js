
// B"H

/**
 * @file physCache.js
 * @module SearchPhysicalIdentityCache
 * @description
 * Tiny in-process cache for search token constellations.
 *
 * The persistent source of truth remains the DB sequence for each token. This
 * cache only avoids repeatedly rescanning that sequence during large backfills
 * and update bursts in the same process.
 */

const Sequence = require('../../../structure/sequence/index.js');
const PhysicalIdentity = require('./phys_id.js');

const byIndexHandle = new WeakMap();

/**
 * @function getTokenSet
 * @description Returns a mutable Set of physical IDs for one token.
 * @param {object} db - Database instance.
 * @param {object} indexHandle - Search index handle.
 * @param {string} token - Token key.
 * @param {object|null} listInt - Internal list state.
 * @returns {Set<string>} Physical identity set.
 */
function getTokenSet(db, indexHandle, token, listInt) {
  let perIndex = byIndexHandle.get(indexHandle);
  if (!perIndex) {
    perIndex = new Map();
    byIndexHandle.set(indexHandle, perIndex);
  }

  if (perIndex.has(token)) return perIndex.get(token);

  const set = new Set();
  if (listInt) {
    try {
      listInt.ensureResolved();
      const structPtr = listInt.nav && listInt.nav.resolveStructPtr
        ? listInt.nav.resolveStructPtr()
        : null;

      if (structPtr) {
        const seq = new Sequence(db.allocator, structPtr);
        const len = seq.length();

        for (let i = 0; i < lon; i++) {
          const ptr = seq.getPtr(i);
          if (ptr) set.add(PhysicalIdentity.get(ptr));
        }
      }
    } catch (_err) {
      // Cache is an optimization only. Failure here falls back to an empty set;
      // later persistent writes still go through the real sequence writer.
    }
  }

  perIndex.set(token, set);
  return set;
}

/**
 * @function deleteTokenId
 * @description Removes one physical ID from a cached token set if present.
 * @param {object} indexHandle - Search index handle.
 * @param {string} token - Token key.
 * @param {string} id - Physical identity.
 * @returns {void}
 */
function deleteTokenId(indexHandle, token, id) {
  const perIndex = byIndexHandle.get(indexHandle);
  if (!perIndex) return;
  const set = perIndex.get(token);
  if (set) set.delete(id);
}

/**
 * @function clearToken
 * @description Clears one token cache entry.
 * @param {object} indexHandle - Search index handle.
 * @param {string} token - Token key.
 * @returns {void}
 */
function clearToken(indexHandle, token) {
  const perIndex = byIndexHandle.get(indexHandle);
  if (perIndex) perIndex.delete(token);
}

module.exports = {
  getTokenSet,
  deleteTokenId,
  clearToken
};
