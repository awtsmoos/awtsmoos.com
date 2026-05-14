
// B"H

/**
 * @file utils/leb128/scribe.js
 * @chapter The Tiny Numbers That Refuse Padding
 * @description
 * Unsigned LEB128 writer/reader.
 * This is the only numeric pointer-length encoding used by SmartPointer.
 * No fixed width.
 * No padding.
 * No extra bytes.
 */

/**
 * @class Leb128Scribe
 * @description
 * Minimal unsigned varint codec.
 */
class Leb128Scribe {
  /**
   * @static
   * @method write
   * @description
   * Writes an unsigned integer into a buffer at offset.
   *
   * @param {Buffer} buf - Destination buffer.
   * @param {number} offset - Start offset.
   * @param {number} value - Unsigned integer value.
   * @returns {number} Number of bytes written.
   */
  static write(buf, offset, value) {
    let n = BigInt(value || 0);
    let pos = offset;

    do {
      let byte = Number(n & 0x7fn);
      n >>= 7n;

      if (n !== 0n) byte |= 0x80;

      buf[pos++] = byte;
    } while (n !== 0n);

    return pos - offset;
  }

  /**
   * @static
   * @method read
   * @description
   * Reads an unsigned integer from a buffer at offset.
   *
   * @param {Buffer} buf - Source buffer.
   * @param {number} offset - Start offset.
   * @returns {{value:number,bytesRead:number}} Decoded value and byte count.
   */
  static read(buf, offset) {
    let result = 0n;
    let shift = 0n;
    let pos = offset;

    while (pos < buf.length) {
      const byte = BigInt(buf[pos++]);
      result |= (byte & 0x7fn) << shift;

      if ((byte & 0x80n) === 0n) {
        return {
          value: Number(result),
          bytesRead: pos - offset
        };
      }

      shift += 7n;
    }

    throw new Error("B'H: LEB128 ended before the number was complete");
  }

  /**
   * @static
   * @method size
   * @description
   * Calculates encoded byte length for an unsigned integer.
   *
   * @param {number} value - Unsigned integer value.
   * @returns {number} Byte size.
   */
  static size(value) {
    let n = BigInt(value || 0);
    let count = 0;

    do {
      n >>= 7n;
      count++;
    } while (n !== 0n);

    return count;
  }

  /**
   * @static
   * @method sizeOf
   * @description
   * Legacy name for the same unsigned LEB128 byte count.
   * The Awtsmoos lets old vessels keep speaking while the newer gate remains
   * exact: one integer, one measured breath, no padded chamber around it.
   *
   * @param {number} value - Unsigned integer value.
   * @returns {number} Byte size.
   */
  static sizeOf(value) {
    return Leb128Scribe.size(value);
  }
}

module.exports = Leb128Scribe;
