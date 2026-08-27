// B"H

/**
 * @file structure/manifest/primitive/encoders/packedArray.js
 * @chapter The Packed Array Token
 * @description Stores pre-encoded packed array bytes as one primitive packet.
 */

const Packet = require('../packet.js');
const TYPE = require('../typeNames.js');

/**
 * @function encodePackedArray
 * @param {*} value - Incoming value.
 * @returns {PrimitivePacket|null} Packet or null.
 */
function encodePackedArray(value) {
  if (!value || value.__awtsmoosPackedArray !== true) return null;
  const raw = Buffer.isBuffer(value.raw) ? value.raw : Buffer.from(value.raw || []);
  return new Packet(TYPE.PACKED_ARRAY, raw, {
    sourceBytes: Number(value.sourceBytes || raw.length),
    storedBytes: raw.length
  });
}

module.exports = encodePackedArray;
