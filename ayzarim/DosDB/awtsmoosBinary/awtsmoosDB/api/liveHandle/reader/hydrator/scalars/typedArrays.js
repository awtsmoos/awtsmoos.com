
// B"H

/**
 * @file api/liveHandle/reader/hydrator/scalars/typedArrays.js
 * @chapter The Metal Arrays Rise
 * @description
 * Restores typed arrays from one constructor-code byte and raw payload bytes.
 */

/**
 * @function ownArrayBuffer
 * @description
 * Copies Buffer bytes into a standalone ArrayBuffer.
 *
 * @param {Buffer} raw - Raw bytes.
 * @returns {ArrayBuffer} Standalone ArrayBuffer.
 */
function ownArrayBuffer(raw) {
  return raw.buffer.slice(raw.byteOffset, raw.byteOffset + raw.byteLength);
}

const FACTORIES = {
  1: raw => new Int8Array(ownArrayBuffer(raw)),
  2: raw => new Uint8Array(ownArrayBuffer(raw)),
  3: raw => new Uint8ClampedArray(ownArrayBuffer(raw)),
  4: raw => new Int16Array(ownArrayBuffer(raw)),
  5: raw => new Uint16Array(ownArrayBuffer(raw)),
  6: raw => new Int32Array(ownArrayBuffer(raw)),
  7: raw => new Uint32Array(ownArrayBuffer(raw)),
  8: raw => new Float32Array(ownArrayBuffer(raw)),
  9: raw => new Float64Array(ownArrayBuffer(raw)),
  10: raw => new BigInt64Array(ownArrayBuffer(raw)),
  11: raw => new BigUint64Array(ownArrayBuffer(raw))
};

/**
 * @function reviveTypedArray
 * @description
 * Revives a typed array from encoded bytes.
 *
 * @param {Buffer} buffer - Encoded typed-array bytes.
 * @returns {*} Revived typed array.
 */
function reviveTypedArray(buffer) {
  if (!buffer || buffer.length < 1) return new Uint8Array(0);

  const code = buffer.readUInt8(0);
  const raw = buffer.subarray(1);
  const factory = FACTORIES[code];

  return factory ? factory(raw) : new Uint8Array(ownArrayBuffer(raw));
}

module.exports = reviveTypedArray;
