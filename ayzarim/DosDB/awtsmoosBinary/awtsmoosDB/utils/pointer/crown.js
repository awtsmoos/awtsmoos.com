
// B"H

/**
 * @file utils/pointer/crown.js
 * @chapter The Crown Without Padding
 * @description
 * The one true pointer format:
 *
 *   [type:1 byte][offset:ULEB128][length:ULEB128]
 *
 * Every pointer is exactly as long as it needs to be.
 * No fixed 16 bytes.
 * No fallback format.
 * No extra padding.
 */

const Leb128 = require('../leb128/scribe.js');

/**
 * @class PointerCrown
 * @description
 * Strict variable-length pointer codec.
 */
class PointerCrown {
  /**
   * @static
   * @method encode
   * @description
   * Encodes type, offset, and length with no padding.
   *
   * @param {number} type - VAL_TYPE byte.
   * @param {number} offset - File offset.
   * @param {number} length - Byte length.
   * @returns {Buffer} Minimal pointer seal.
   */
  static encode(type, offset, length) {
    const safeType = Number(type || 0) & 0xff;
    const safeOffset = Number(offset || 0);
    const safeLength = Number(length || 0);

    const total = 1 + Leb128.size(safeOffset) + Leb128.size(safeLength);
    const out = Buffer.allocUnsafe(total);

    let pos = 0;
    out[pos++] = safeType;
    pos += Leb128.write(out, pos, safeOffset);
    pos += Leb128.write(out, pos, safeLength);

    return out.subarray(0, pos);
  }

  /**
   * @static
   * @method decode
   * @description
   * Decodes a pointer seal from a larger buffer.
   *
   * @param {Buffer} buf - Source buffer.
   * @param {number} [start=0] - Start offset.
   * @returns {{type:number,offset:number,length:number,byteSize:number}} Pointer.
   */
  static decode(buf, start = 0) {
    if (!Buffer.isBuffer(buf)) return buf || null;
    if (buf.length <= start) return null;

    let pos = start;
    const type = buf[pos++];

    const offset = Leb128.read(buf, pos);
    pos += offset.bytesRead;

    const length = Leb128.read(buf, pos);
    pos += length.bytesRead;

    return {
      type,
      offset: offset.value,
      length: length.value,
      byteSize: pos - start
    };
  }

  /**
   * @static
   * @method readSize
   * @description
   * Reads exact pointer byte size.
   *
   * @param {Buffer} buf - Source buffer.
   * @param {number} [start=0] - Start offset.
   * @returns {number} Exact pointer byte size.
   */
  static readSize(buf, start = 0) {
    const ptr = this.decode(buf, start);
    return ptr ? ptr.byteSize : 0;
  }

  /**
   * @static
   * @method getType
   * @description
   * Reads the one-byte type without decoding the whole pointer.
   *
   * @param {Buffer|object} buf - Pointer seal or decoded pointer.
   * @param {number} [start=0] - Start offset.
   * @returns {number} Type byte.
   */
  static getType(buf, start = 0) {
    if (!buf) return 0;
    if (!Buffer.isBuffer(buf)) return Number(buf.type || 0);
    return buf.length > start ? buf[start] & 0xff : 0;
  }

  /**
   * @static
   * @method toBuffer
   * @description
   * Converts decoded pointer object into minimal pointer seal.
   *
   * @param {object|Buffer} ptr - Decoded pointer or existing seal.
   * @returns {Buffer} Pointer seal.
   */
  static toBuffer(ptr) {
    if (Buffer.isBuffer(ptr)) return ptr;
    return this.encode(ptr.type, ptr.offset, ptr.length);
  }
}

module.exports = PointerCrown;
