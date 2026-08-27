
// B"H

/**
 * @file structure/manifest/primitive/packet.js
 * @chapter The Tiny Vessel Before The Pointer Crown
 * @description
 * Encoders return packets. Packets are small, exact, and contain the numeric
 * type, the bytes that must be written, and optional byte-truth metadata.
 */

/**
 * @class PrimitivePacket
 * @description
 * Immutable packet for primitive storage.
 */
class PrimitivePacket {
  /**
   * @constructor
   * @param {number} type - Stored VAL_TYPE.
   * @param {Buffer} buffer - Stored bytes.
   * @param {object} [meta={}] - Byte accounting metadata.
   */
  constructor(type, buffer, meta = {}) {
    this.type = type;
    this.buffer = buffer || Buffer.alloc(0);
    this.meta = {
      sourceBytes: this.buffer.length,
      storedBytes: this.buffer.length,
      compressed: false,
      ...meta
    };
  }
}

module.exports = PrimitivePacket;
