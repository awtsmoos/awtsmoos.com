
// B"H

/**
 * @file utils/smartPointer/core/fallbackCodec.js
 * @chapter The Emergency Crown
 * @description
 * If the original variable-length crown helpers are missing, this codec keeps
 * the engine alive. It still writes the same conceptual fields:
 * type, offset, length.
 */

const Scribe = require('../../leb128/scribe.js');

/**
 * @class FallbackCodec
 * @description
 * Varint pointer codec fallback.
 */
class FallbackCodec {
  /**
   * @static
   * @method encode
   * @description
   * Encodes type, offset, and length into a variable-sized pointer seal.
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
   * Decodes a variable-sized pointer seal.
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
   * Reads pointer seal byte size without resolving the value.
   *
   * @param {Buffer} buf - Source buffer.
   * @param {number} [start=0] - Start offset.
   * @returns {number} Seal size.
   */
  static readSize(buf, start = 0) {
    const decoded = this.decode(buf, start);
    return decoded ? decoded.byteSize : 0;
  }

  /**
   * @static
   * @method getType
   * @description
   * Reads type byte directly.
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

module.exports = FallbackCodec;
