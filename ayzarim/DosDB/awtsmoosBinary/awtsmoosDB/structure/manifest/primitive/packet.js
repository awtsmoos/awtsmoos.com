
// B"H

/**
 * @file structure/manifest/primitive/packet.js
 * @chapter The Tiny Vessel Before The Pointer Crown
 * @description
 * Encoders return packets. Packets are small, exact, and contain only the
 * numeric type plus the bytes that must be written.
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
   */
  constructor(type, buffer) {
    this.type = type;
    this.buffer = buffer || Buffer.alloc(0);
  }
}

module.exports = PrimitivePacket;
