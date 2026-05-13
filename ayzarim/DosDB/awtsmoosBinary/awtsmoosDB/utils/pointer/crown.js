
// B"H

/**
 * @file utils/pointer/crown.js
 * @chapter The Seal Of Keter Restored
 * @description
 * Low-level variable-length pointer crown.
 * This is the core binary pointer format:
 * one type byte, then LEB128 offset, then LEB128 length.
 */

const Scribe = require('../leb128/scribe.js');

/**
 * @class PointerCrown
 * @description
 * Variable-length pointer codec.
 */
class PointerCrown {
  /**
   * @static
   * @method encode
   * @description
   * Encodes pointer coordinates.
   *
   * @param {number} type - VAL_TYPE.
   * @param {number} offset - File offset.
   * @param {number} length - Byte length.
   * @returns {Buffer} Pointer seal.
   */
  static encode(type, offset, length) {
    const buf = Buffer.allocUnsafe(25);
    let pos = 0;

    buf[pos++] = Number(type || 0) & 0xff;
    pos += Scribe.write(buf, pos, Number(offset || 0));
    pos += Scribe.write(buf, pos, Number(length || 0));

    return buf.subarray(0, pos);
  }

  /**
   * @static
   * @method decode
   * @description
   * Decodes pointer coordinates from a buffer.
   *
   * @param {Buffer} buf - Source buffer.
   * @param {number} [start=0] - Start offset.
   * @returns {object|null} Decoded pointer.
   */
  static decode(buf, start = 0) {
    if (!buf || buf.length <= start) return null;

    let pos = start;
    const type = buf[pos++];

    const off = Scribe.read(buf, pos);
    pos += off.bytesRead;

    const len = Scribe.read(buf, pos);
    pos += len.bytesRead;

    return {
      type,
      offset: off.value,
      length: len.value,
      byteSize: pos - start
    };
  }

  /**
   * @static
   * @method readSize
   * @description
   * Returns exact encoded pointer byte length.
   *
   * @param {Buffer} buf - Source buffer.
   * @param {number} [start=0] - Start offset.
   * @returns {number} Pointer size.
   */
  static readSize(buf, start = 0) {
    const decoded = this.decode(buf, start);
    return decoded ? decoded.byteSize : 0;
  }

  /**
   * @static
   * @method toBuffer
   * @description
   * Converts decoded pointer object to Buffer seal.
   *
   * @param {object|Buffer} p - Pointer.
   * @returns {Buffer} Pointer seal.
   */
  static toBuffer(p) {
    if (!p) return Buffer.alloc(0);
    if (Buffer.isBuffer(p)) return p;
    return this.encode(p.type || 0, p.offset || 0, p.length || 0);
  }

  /**
   * @static
   * @method getType
   * @description
   * Reads pointer type byte.
   *
   * @param {Buffer} buf - Source buffer.
   * @param {number} [start=0] - Start offset.
   * @returns {number} VAL_TYPE.
   */
  static getType(buf, start = 0) {
    if (!buf || buf.length <= start) return 0;
    return buf[start] & 0xff;
  }
}

module.exports = PointerCrown;
