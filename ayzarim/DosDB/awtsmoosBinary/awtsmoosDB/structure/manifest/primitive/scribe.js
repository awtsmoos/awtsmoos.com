
// B"H

/**
 * @file structure/manifest/primitive/scribe.js
 * @chapter The Chisel Of The Small Vessels
 * @description
 * PrimitiveScribe is the single gate for non-container values.
 * It does not guess. It walks a strict encoder table and saves exact bytes.
 */

const Pointer = require('../../../utils/pointer/crown.js');
const encoders = require('./encoders/index.js');

/**
 * @class PrimitiveScribe
 * @description
 * Saves primitive values into the allocator and returns pointer seals.
 */
class PrimitiveScribe {
  /**
   * @constructor
   * @param {object} allocator - Allocator vessel.
   */
  constructor(allocator) {
    this.allocator = allocator;
    this.pager = allocator.pager;
  }

  /**
   * @method encode
   * @description
   * Finds the first encoder that recognizes the value.
   *
   * @param {*} value - Value to encode.
   * @returns {object} Primitive packet.
   */
  encode(value) {
    for (const encode of encoders) {
      const packet = encode(value, this);
      if (packet) return packet;
    }

    return encoders[0](null);
  }

  /**
   * @method save
   * @description
   * Writes encoded bytes and returns a pointer crown.
   *
   * @param {*} value - Value to save.
   * @returns {Buffer} Pointer seal.
   */
  save(value) {
    const packet = this.encode(value);
    const loc = this.allocator.allocate(packet.buffer.length);

    if (packet.buffer.length) {
      this.pager.writeExact(loc.offset, packet.buffer);
    }

    if (this.allocator.db && this.allocator.db.metrics) {
      this.allocator.db.metrics.recordPrimitive(packet);
    }

    return Pointer.encode(packet.type, loc.offset, packet.buffer.length);
  }
}

module.exports = PrimitiveScribe;
