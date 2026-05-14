
// B"H

/**
 * @file structure/manifest/primitive/encoders/typedArray.js
 * @chapter The Metal Arrays Enter Their Codes
 * @description
 * ArrayBuffer and typed arrays are stored without becoming generic objects.
 */

const Packet = require('../packet.js');
const TYPE = require('../typeNames.js');
const Compression = require('../compression.js');

let Omni = null;

try {
  Omni = require('../../../../utils/compression/omni.js');
} catch (_err) {
  Omni = null;
}

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
function compressedPacket(type, compressedType, raw, sourceBytes, context) {
  if (Omni && Compression.isEnabled(context)) {
    const packed = Omni.packBinary(raw);

    if (packed.compressed) {
      return new Packet(compressedType, packed.buffer, {
        sourceBytes,
        storedBytes: packed.buffer.length,
        compressed: true
      });
    }
  }

  return new Packet(type, raw, {
    sourceBytes,
    storedBytes: raw.length
  });
}

/**
 * @function encodeTypedArray
 * @description Encodes ArrayBuffer and typed arrays.
 * @param {*} value - Incoming value.
 * @param {object} context - Primitive scribe context.
 * @returns {PrimitivePacket|null} Encoded packet or null.
 */
function encodeTypedArray(value, context) {
  if (value instanceof ArrayBuffer) {
    const raw = Buffer.from(value);

    return compressedPacket(
      TYPE.ARRAY_BUFFER,
      TYPE.ARRAY_BUFFER_OMNI,
      raw,
      raw.length,
      context
    );
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

  return compressedPacket(
    TYPE.TYPED_ARRAY,
    TYPE.TYPED_ARRAY_OMNI,
    out,
    raw.length,
    context
  );
}

module.exports = encodeTypedArray;
