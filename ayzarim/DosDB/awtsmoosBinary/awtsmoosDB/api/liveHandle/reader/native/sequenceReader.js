
// B"H

/**
 * @file api/liveHandle/reader/native/sequenceReader.js
 * @chapter The Sequence Body Is Read Without A Mask
 * @description
 * Reads a sequence-backed pointer directly into native Array or Set.
 */

const SequenceEngine = require('../../../../structure/sequence/index.js');
const SmartPointer = require('../../../../utils/smartPointer/index.js');

/**
 * @function makeSequence
 * @description
 * Creates SequenceEngine from any sequence-backed pointer.
 *
 * @param {object} db - DB instance.
 * @param {Buffer|object} ptr - Pointer.
 * @returns {SequenceEngine} Engine.
 */
function makeSequence(db, ptr) {
  const decoded = SmartPointer.decode(ptr);

  return new SequenceEngine(db.allocator, {
    type: decoded.type,
    offset: decoded.offset,
    length: decoded.length
  });
}

/**
 * @function toArray
 * @description
 * Reads sequence-backed pointer as native Array.
 *
 * @param {object} db - DB instance.
 * @param {Buffer|object} ptr - Pointer.
 * @param {object} ctx - Resolve context.
 * @returns {Array<*>} Native array.
 */
function toArray(db, ptr, ctx) {
  const engine = makeSequence(db, ptr);
  const out = [];
  const length = engine.length();

  for (let i = 0; i < length; i++) {
    out.push(engine.get(i, ctx));
  }

  return out;
}

/**
 * @function toSet
 * @description
 * Reads sequence-backed pointer as native Set.
 *
 * @param {object} db - DB instance.
 * @param {Buffer|object} ptr - Pointer.
 * @param {object} ctx - Resolve context.
 * @returns {Set<*>} Native Set.
 */
function toSet(db, ptr, ctx) {
  return new Set(toArray(db, ptr, ctx));
}

module.exports = {
  toArray,
  toSet
};
