
// B"H

/**
 * @file utils/smartPointer/resolveScalar.js
 * @chapter The Pointer Crown Yields Its Hidden Spark
 * @description
 * A compatibility resolver so older SmartPointer.resolve callers also get
 * correct RegExp, BigInt, Function, Symbol, Date, Buffer, and typed arrays.
 */

const Hydrator = require('../../api/liveHandle/reader/hydrator/index.js');

/**
 * @function resolveScalar
 * @description Resolves a decoded pointer through the central hydrator.
 * @param {object} ptr - Decoded pointer.
 * @param {object} allocator - Allocator.
 * @returns {*} Hydrated value.
 */
function resolveScalar(ptr, allocator) {
  const hydrator = new Hydrator(allocator);
  return hydrator.hydrateDecoded(ptr);
}

module.exports = resolveScalar;
