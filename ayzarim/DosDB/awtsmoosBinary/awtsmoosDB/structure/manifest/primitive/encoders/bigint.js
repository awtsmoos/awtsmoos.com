
// B"H

/**
 * @file structure/manifest/primitive/encoders/bigint.js
 * @chapter The Integer Mountain That Refused To Become Dust
 * @description
 * BigInt must be stored losslessly. It is not a Number. It is not JSON. It is
 * a signed base-256 body, carried back exactly.
 */

const Packet = require('../packet.js');
const TYPE = require('../typeNames.js');

/**
 * @function bigintToBuffer
 * @description Converts positive BigInt magnitude into big-endian bytes.
 * @param {bigint} value - Non-negative BigInt.
 * @returns {Buffer} Magnitude bytes.
 */
function bigintToBuffer(value) {
  if (value === 0n) return Buffer.from([0]);

  let hex = value.toString(16);
  if (hex.length % 2) hex = `0${hex}`;

  return Buffer.from(hex, 'hex');
}

/**
 * @function encodeBigInt
 * @description Encodes BigInt with sign-preserving type.
 * @param {*} value - Incoming value.
 * @returns {PrimitivePacket|null} Encoded packet or null.
 */
function encodeBigInt(value) {
  if (typeof value !== 'bigint') return null;

  const negative = value < 0n;
  const magnitude = negative ? -value : value;

  return new Packet(
    negative ? TYPE.BIGINT_NEG : TYPE.BIGINT,
    bigintToBuffer(magnitude)
  );
}

module.exports = encodeBigInt;
