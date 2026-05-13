
// B"H

/**
 * @file api/liveHandle/reader/hydrator/index.js
 * @chapter The Hydrator That Knows What Is Alive
 * @description
 * Central read gate for pointer bytes. Scalars return real JavaScript values.
 * Containers return structure descriptors for LiveHandle wrapping.
 */

const constants = require('../../../constants.js');
const SmartPointer = require('../../../utils/smartPointer/index.js');
const Scalars = require('./scalars/index.js');

const T = constants.VAL_TYPE;

const CONTAINERS = new Set([
  T.MAP,
  T.JS_MAP,
  T.SEQUENCE,
  T.DICTIONARY,
  T.SET,
  T.JS_SET,
  T.OBJECT,
  T.ARRAY,
  T.JSON,
  T.SMART_OBJECT,
  T.SMART_ARRAY,
  T.ANCHOR
]);

/**
 * @class Hydrator
 * @description
 * Converts pointer seals into scalar values or structure descriptors.
 */
class Hydrator {
  /**
   * @constructor
   * @param {object} allocator - Allocator vessel.
   */
  constructor(allocator) {
    this.allocator = allocator;
    this.db = allocator.db;
  }

  /**
   * @method readBytes
   * @description Reads bytes for a decoded pointer.
   * @param {object} ptr - Decoded pointer.
   * @returns {Buffer} Raw bytes.
   */
  readBytes(ptr) {
    if (!ptr || !ptr.length) return Buffer.alloc(0);
    return this.db._readChainSafe(ptr) || Buffer.alloc(0);
  }

  /**
   * @method hydrateDecoded
   * @description Hydrates a decoded pointer object.
   * @param {object} ptr - Decoded pointer.
   * @returns {*} Hydrated value or structure descriptor.
   */
  hydrateDecoded(ptr) {
    if (!ptr) return undefined;

    if (CONTAINERS.has(ptr.type)) {
      return {
        isStructure: true,
        type: ptr.type,
        ptr
      };
    }

    const bytes = this.readBytes(ptr);
    const scalar = Scalars.hydrateScalar(ptr.type, bytes);

    if (scalar.hit) return scalar.value;

    return bytes;
  }

  /**
   * @method hydrate
   * @description Hydrates a pointer seal or decoded pointer.
   * @param {Buffer|object} seal - Pointer seal or decoded pointer.
   * @returns {*} Hydrated value.
   */
  hydrate(seal) {
    const ptr = Buffer.isBuffer(seal) ? SmartPointer.decode(seal) : seal;
    return this.hydrateDecoded(ptr);
  }
}

module.exports = Hydrator;
