
// B"H

/**
 * @file api/liveHandle/reader/hydrator/substances/typed_arrays.js
 * @chapter The Metal Array Breathes Again
 * @description
 * Constructor-code based typed array resurrection.
 */

const FACTORIES = {
  1: raw => new Int8Array(raw.buffer.slice(raw.byteOffset, raw.byteOffset + raw.byteLength)),
  2: raw => new Uint8Array(raw.buffer.slice(raw.byteOffset, raw.byteOffset + raw.byteLength)),
  3: raw => new Uint8ClampedArray(raw.buffer.slice(raw.byteOffset, raw.byteOffset + raw.byteLength)),
  4: raw => new Int16Array(raw.buffer.slice(raw.byteOffset, raw.byteOffset + raw.byteLength)),
  5: raw => new Uint16Array(raw.buffer.slice(raw.byteOffset, raw.byteOffset + raw.byteLength)),
  6: raw => new Int32Array(raw.buffer.slice(raw.byteOffset, raw.byteOffset + raw.byteLength)),
  7: raw => new Uint32Array(raw.buffer.slice(raw.byteOffset, raw.byteOffset + raw.byteLength)),
  8: raw => new Float32Array(raw.buffer.slice(raw.byteOffset, raw.byteOffset + raw.byteLength)),
  9: raw => new Float64Array(raw.buffer.slice(raw.byteOffset, raw.byteOffset + raw.byteLength)),
  10: raw => new BigInt64Array(raw.buffer.slice(raw.byteOffset, raw.byteOffset + raw.byteLength)),
  11: raw => new BigUint64Array(raw.buffer.slice(raw.byteOffset, raw.byteOffset + raw.byteLength))
};

/**
 * @function resurrect
 * @description Rebuilds a typed array by constructor code.
 * @param {number} code - Constructor code.
 * @param {Buffer} raw - Raw bytes.
 * @returns {TypedArray} Revived typed array.
 */
function resurrect(code, raw) {
  const fn = FACTORIES[code];
  return fn ? fn(raw) : new Uint8Array(raw);
}

module.exports = {
  resurrect
};
