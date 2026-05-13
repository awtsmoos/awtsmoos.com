
// B"H

/**
 * @file structure/manifest/primitive/encoders/typedArray.js
 * @chapter The Metal Arrays Enter Their Codes
 * @description
 * ArrayBuffer and typed arrays are stored without becoming generic objects.
 */

const Packet = require('../packet.js');
const TYPE = require('../typeNames.js');

const CODES = new Map([
  [Int8Array, 1],
  [Uint8Array, 2],
  [Uint8ClampedArray, 3],
  [Int16Array, 4],
  [Uint16Array, 5],
  [Int32Array, 6],
  [Uint32Array, 7],
  [Float32Array, 8],
  [Float64Array, 9],
  [BigInt64Array, 10],
  [BigUint64Array, 11]
]);

/**
 * @function encodeTypedArray
 * @description Encodes ArrayBuffer and typed arrays.
 * @param {*} value - Incoming value.
 * @returns {PrimitivePacket|null} Encoded packet or null.
 */
function encodeTypedArray(value) {
  if (value instanceof ArrayBuffer) {
    return new Packet(TYPE.ARRAY_BUFFER, Buffer.from(value));
  }

  if (!ArrayBuffer.isView(value)) return null;
  if (Buffer.isBuffer(value)) return null;
  if (value instanceof DataView) return null;

  const code = CODES.get(value.constructor);
  if (!code) return null;

  const raw = Buffer.from(value.buffer, value.byteOffset, value.byteLength);
  const out = Buffer.allocUnsafe(raw.length + 1);

  out.writeUInt8(code, 0);
  raw.copy(out, 1);

  return new Packet(TYPE.TYPED_ARRAY, out);
}

module.exports = encodeTypedArray;
