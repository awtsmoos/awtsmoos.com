
// B"H

/**
 * @file utils/smartPointer/core/crownFacade.js
 * @chapter The Old Crown Restored
 * @description
 * A safe facade over utils/pointer/crown.js and fallbackCodec.js.
 * The database core uses variable-length pointer seals. This facade preserves
 * that reality and never falls back to fixed-size pointers unless forced.
 */

const FallbackCodec = require('./fallbackCodec.js');

let Crown = null;

try {
  Crown = require('../../pointer/crown.js');
} catch (_err) {
  Crown = null;
}

/**
 * @class CrownFacade
 * @description
 * Compatibility wrapper around the pointer crown.
 */
class CrownFacade {
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
    if (Crown && typeof Crown.encode === 'function') {
      return Crown.encode(type, offset, length);
    }

    return FallbackCodec.encode(type, offset, length);
  }

  /**
   * @static
   * @method decode
   * @description
   * Decodes a pointer seal.
   *
   * @param {Buffer} buf - Source buffer.
   * @param {number} [start=0] - Start offset.
   * @returns {object|null} Decoded pointer.
   */
  static decode(buf, start = 0) {
    if (!buf || !Buffer.isBuffer(buf)) return buf || null;

    if (Crown && typeof Crown.decode === 'function') {
      const decoded = Crown.decode(buf, start);
      if (decoded && decoded.byteSize === undefined) {
        decoded.byteSize = FallbackCodec.readSize(buf, start);
      }
      return decoded;
    }

    return FallbackCodec.decode(buf, start);
  }

  /**
   * @static
   * @method readSize
   * @description
   * Reads pointer seal byte size.
   *
   * @param {Buffer} buf - Source buffer.
   * @param {number} [start=0] - Start offset.
   * @returns {number} Seal byte size.
   */
  static readSize(buf, start = 0) {
    if (!buf || buf.length <= start) return 0;

    if (Crown && typeof Crown.readSize === 'function') {
      return Crown.readSize(buf, start);
    }

    const decoded = this.decode(buf, start);
    return decoded && decoded.byteSize ? decoded.byteSize : 0;
  }

  /**
   * @static
   * @method getType
   * @description
   * Reads type quickly.
   *
   * @param {Buffer} buf - Source buffer.
   * @param {number} [start=0] - Start offset.
   * @returns {number} VAL_TYPE.
   */
  static getType(buf, start = 0) {
    if (!buf || buf.length <= start) return 0;

    if (Crown && typeof Crown.getType === 'function') {
      return Crown.getType(buf, start);
    }

    return FallbackCodec.getType(buf, start);
  }
}

module.exports = CrownFacade;
