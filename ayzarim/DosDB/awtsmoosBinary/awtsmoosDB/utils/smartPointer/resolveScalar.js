
// B"H

/**
 * @file utils/smartPointer/resolveScalar.js
 * @chapter The Pointer Crown Yields Its Hidden Spark
 * @description
 * Compatibility resolver for older SmartPointer.resolve callers.
 */

/**
 * @function resolveScalar
 * @description
 * Resolves a decoded pointer through the central hydrator.
 *
 * @param {object} ptr - Decoded pointer.
 * @param {object} allocator - Allocator.
 * @returns {*} Hydrated value.
 */
function resolveScalar(ptr, allocator) {
  const Hydrator = require('../../api/liveHandle/reader/hydrator/index.js');
  const hydrator = new Hydrator(allocator);
  return hydrator.hydrateDecoded(ptr);
}

module.exports = resolveScalar;
