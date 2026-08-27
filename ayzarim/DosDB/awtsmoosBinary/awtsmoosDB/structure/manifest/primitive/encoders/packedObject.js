// B\"H

/**
 * @file structure/manifest/primitive/encoders/packedObject.js
 * @chapter The Packed House Token
 * @description Stores pre-encoded packed object bytes as a single primitive value.
 */

const Packet = require('../packet.js');
const TYPE = require('../typeNames.js');

/**
 * @function encodePackedObject
 * @param {*} value - Incoming value.
 * @returns {PrimitivePacket|null} Packet or null.
 */
function encodePackedObject(value) {
  if (!value || value.__awtsmoosPackedObject !== true) {
    return null;
  }

  const raw = Buffer.isBuffer(value.raw) ? value.raw : Buffer.from(value.raw || []);
  return new Packet(TYPE.PACKED_OBJECT, raw, {
    sourceBytes: Number(value.sourceBytes || raw.length),
    storedBytes: raw.length
  });
}

module.exports = encodePackedObject;
