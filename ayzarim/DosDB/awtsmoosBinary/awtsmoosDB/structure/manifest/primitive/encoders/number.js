
// B"H

/**
 * @file structure/manifest/primitive/encoders/number.js
 * @chapter The Measured Flame Becomes Smaller
 * @description
 * JavaScript numbers now take the smallest exact binary body when they
 * are safe integers. Only true fractional numbers need an 8-byte double.
 */

const Packet = require('../packet.js');
const TYPE = require('../typeNames.js');

/**
 * @function encodeNumber
 * @description Encodes JavaScript number values with minimal exact integer bodies.
 * @param {*} value - Incoming value.
 * @returns {PrimitivePacket|null} Encoded packet or null.
 */
function encodeNumber(value) {
  if (typeof value !== 'number') return null;

  if (Number.isNaN(value)) return new Packet(TYPE.NAN);
  if (value === Infinity) return new Packet(TYPE.INFINITY);
  if (value === -Infinity) return new Packet(TYPE.NEG_INFINITY);

  if (value === 0) return new Packet(TYPE.NUMBER_ZERO);
  if (value === 1) return new Packet(TYPE.NUMBER_ONE);
  if (value === -1) return new Packet(TYPE.NUMBER_NEG_ONE);


  if (value === 0) return new Packet(TYPE.NUMBER_ZERO);
  if (value === 1) return new Packet(TYPE.NUMBER_ONE);
  if (value === -1) return new Packet(TYPE.NUMBER_NEG_ONE);


  if (Number.isSafeInteger(value)) {
    if (value >= 0 && value <= 0xff) {
      const buffer = Buffer.allocUnsafe(1);
      buffer.writeUInt8(value, 0);
      return new Packet(TYPE.UINT8, buffer);
    }

    if (value >= 0 && value <= 0xffff) {
      const buffer = Buffer.allocUnsafe(2);
      buffer.writeUInt16BE(value, 0);
      return new Packet(TYPE.UINT16, buffer);
    }

    if (value >= 0 && value <= 0xffffffff) {
      const buffer = Buffer.allocUnsafe(4);
      buffer.writeUInt32BE(value, 0);
      return new Packet(TYPE.UINT32, buffer);
    }

    if (value >= 0) {
      const buffer = Buffer.allocUnsafe(8);
      buffer.writeBigUInt64BE(BigInt(value), 0);
      return new Packet(TYPE.UINT64, buffer);
    }

    const mag = Math.abs(value);
    if (mag <= 0xff) {
      const buffer = Buffer.allocUnsafe(1);
      buffer.writeUInt8(mag, 0);
      return new Packet(TYPE.INT8_NEG, buffer);
    }

    if (mag <= 0xffff) {
      const buffer = Buffer.allocUnsafe(2);
      buffer.writeUInt16BE(mag, 0);
      return new Packet(TYPE.INT16_NEG, buffer);
    }

    if (mag <= 0xffffffff) {
      const buffer = Buffer.allocUnsafe(4);
      buffer.writeUInt32BE(mag, 0);
      return new Packet(TYPE.INT32_NEG, buffer);
    }

    const buffer = Buffer.allocUnsafe(8);
    buffer.writeBigUInt64BE(BigInt(mag), 0);
    return new Packet(TYPE.INT64_NEG, buffer);
  }

  const buffer = Buffer.allocUnsafe(8);
  if (value < 0) {
    buffer.writeDoubleBE(-value, 0);
    return new Packet(TYPE.DOUBLE_NEG, buffer);
  }

  buffer.writeDoubleBE(value, 0);
  return new Packet(TYPE.DOUBLE_POS, buffer);
}

module.exports = encodeNumber;
