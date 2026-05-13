
// B"H

/**
 * @file structure/manifest/primitive/encoders/number.js
 * @chapter The Measured Flame
 * @description
 * JavaScript numbers are stored as doubles, with NaN and infinities as
 * explicit marker types so they return exactly as they entered.
 */

const Packet = require('../packet.js');
const TYPE = require('../typeNames.js');

/**
 * @function encodeNumber
 * @description Encodes JavaScript number values.
 * @param {*} value - Incoming value.
 * @returns {PrimitivePacket|null} Encoded packet or null.
 */
function encodeNumber(value) {
  if (typeof value !== 'number') return null;

  if (Number.isNaN(value)) return new Packet(TYPE.NAN);
  if (value === Infinity) return new Packet(TYPE.INFINITY);
  if (value === -Infinity) return new Packet(TYPE.NEG_INFINITY);

  const buffer = Buffer.allocUnsafe(8);
  buffer.writeDoubleBE(value, 0);

  return new Packet(TYPE.NUMBER, buffer);
}

module.exports = encodeNumber;
