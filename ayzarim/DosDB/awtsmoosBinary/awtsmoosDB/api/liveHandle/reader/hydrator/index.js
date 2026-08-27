
// B"H

/**
 * @file api/liveHandle/reader/hydrator/index.js
 * @chapter The Hydrator That Knows What Is Alive
 * @description
 * Central read gate for pointer bytes.
 * Uses rootRequire, so this file can never again break from bad ../../../ math.
 */

const rootRequire = require('./root.js');
const SmartPointer = rootRequire('utils', 'smartPointer', 'index.js');
const Scalars = require('./scalars/index.js');
const CONTAINERS = require('./containerTypes.js');

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
   * @description
   * Reads raw bytes for a decoded pointer.
   *
   * @param {object} ptr - Decoded pointer.
   * @returns {Buffer} Stored bytes.
   */
  readBytes(ptr) {
    if (!ptr || !ptr.length) return Buffer.alloc(0);
    return this.db._readChainSafe(ptr) || Buffer.alloc(0);
  }

  /**
   * @method hydrateDecoded
   * @description
   * Hydrates a decoded pointer.
   *
   * @param {object} ptr - Decoded pointer.
   * @returns {*} Hydrated scalar or structure descriptor.
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

    const scalar = Scalars.hydrateScalar(ptr.type, this.readBytes(ptr), {
      db: this.db,
      allocator: this.allocator
    });

    if (scalar.hit) return scalar.value;

    return this.readBytes(ptr);
  }

  /**
   * @method hydrate
   * @description
   * Hydrates a pointer seal or decoded pointer.
   *
   * @param {Buffer|object} seal - Pointer seal or decoded pointer.
   * @returns {*} Hydrated value.
   */
  hydrate(seal) {
    const ptr = Buffer.isBuffer(seal) ? SmartPointer.decode(seal) : seal;
    return this.hydrateDecoded(ptr);
  }
}

module.exports = Hydrator;
