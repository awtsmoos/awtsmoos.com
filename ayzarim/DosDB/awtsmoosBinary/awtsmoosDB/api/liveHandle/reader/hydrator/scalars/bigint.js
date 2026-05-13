
// B"H

/**
 * @file api/liveHandle/reader/hydrator/scalars/bigint.js
 * @chapter The Mountain Returns From Its Bytes
 * @description
 * Revives BigInt from big-endian magnitude bytes.
 */

/**
 * @function fromBuffer
 * @description Converts magnitude bytes to BigInt.
 * @param {Buffer} buffer - Magnitude bytes.
 * @param {boolean} negative - Whether the result is negative.
 * @returns {bigint} Revived BigInt.
 */
function fromBuffer(buffer, negative) {
  if (!buffer || buffer.length === 0) return 0n;

  const hex = buffer.toString('hex') || '00';
  const magnitude = BigInt(`0x${hex}`);
  return negative ? -magnitude : magnitude;
}

module.exports = {
  fromBuffer
};
