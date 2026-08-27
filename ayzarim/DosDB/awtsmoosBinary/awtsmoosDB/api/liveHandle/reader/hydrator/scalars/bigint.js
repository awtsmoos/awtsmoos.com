
// B"H

/**
 * @file api/liveHandle/reader/hydrator/scalars/bigint.js
 * @chapter The Mountain Returns From Its Bytes
 * @description
 * BigInt revives from unsigned magnitude bytes plus the sign carried by type.
 */

/**
 * @function fromBuffer
 * @description
 * Converts big-endian magnitude bytes back into a BigInt.
 *
 * @param {Buffer} buffer - Magnitude bytes.
 * @param {boolean} negative - Whether to negate the magnitude.
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
