
// B"H

/**
 * @file utils/smartPointer/manualCodec.js
 * @chapter The Sixteen Byte Crown
 * @description
 * Fallback pointer codec used when the older crown module does not expose the
 * exact method shape a caller expects.
 */

const POINTER_SIZE = 16;

/**
 * @function encode
 * @description
 * Encodes a pointer into a stable 16-byte seal.
 *
 * Layout:
 * byte 0: type
 * bytes 1-8: offset
 * bytes 9-12: length
 * byte 13: flags
 * bytes 14-15: blockId low bits
 *
 * @param {object} ptr - Pointer object.
 * @returns {Buffer} Pointer seal.
 */
function encode(ptr) {
  const out = Buffer.alloc(POINTER_SIZE);

  out.writeUInt8(ptr.type & 0xff, 0);
  out.writeBigUInt64BE(BigInt(ptr.offset || 0), 1);
  out.writeUInt32BE((ptr.length || 0) >>> 0, 9);
  out.writeUInt8((ptr.flags || 0) & 0xff, 13);
  out.writeUInt16BE((ptr.blockId || 0) & 0xffff, 14);

  return out;
}

/**
 * @function decode
 * @description
 * Decodes a 16-byte pointer seal.
 *
 * @param {Buffer} seal - Pointer seal.
 * @returns {object} Decoded pointer.
 */
function decode(seal) {
  return {
    type: seal.readUInt8(0),
    offset: Number(seal.readBigUInt64BE(1)),
    length: seal.readUInt32BE(9),
    flags: seal.length > 13 ? seal.readUInt8(13) : 0,
    blockId: seal.length > 15 ? seal.readUInt16BE(14) : 0
  };
}

module.exports = {
  POINTER_SIZE,
  encode,
  decode
};
