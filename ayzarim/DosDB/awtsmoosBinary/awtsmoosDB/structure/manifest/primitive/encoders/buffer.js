
// B"H

/**
 * @file structure/manifest/primitive/encoders/buffer.js
 * @chapter The Raw Stone Is Already Bytes
 * @description
 * Buffer is copied into the primitive vessel as raw bytes.
 */

const Packet = require('../packet.js');
const TYPE = require('../typeNames.js');

/**
 * @function encodeBuffer
 * @description Encodes Buffers.
 * @param {*} value - Incoming value.
 * @returns {PrimitivePacket|null} Encoded packet or null.
 */
function encodeBuffer(value) {
  if (!Buffer.isBuffer(value)) return null;
  return new Packet(TYPE.BUFFER, Buffer.from(value));
}

module.exports = encodeBuffer;
