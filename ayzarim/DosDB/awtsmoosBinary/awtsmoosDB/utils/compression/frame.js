// B"H

/**
 * @file utils/compression/frame.js
 * @chapter The Seal Around The Contracted Breath
 * @description
 * Compression frames mark which bytes are raw memory and which are folded
 * echoes. The header is tiny, exact, and LEB128-measured so even the seal
 * refuses the laziness of padding.
 */

const Leb128 = require('../leb128/scribe.js');

const MAGIC = Buffer.from([0x07, 0x41, 0x57, 0x31]);
const MODE_LZ = 1;
const MODE_RLE = 2;

/**
 * @class CompressionFrame
 * @description Minimal frame envelope for compressed byte streams.
 */
class CompressionFrame {
  /**
   * @static
   * @method wrap
   * @description Wraps a compressed payload with mode and raw length.
   * @param {number} mode - Compression mode.
   * @param {number} rawLength - Original byte length.
   * @param {Buffer} payload - Compressed bytes.
   * @returns {Buffer} Framed bytes.
   */
  static wrap(mode, rawLength, payload) {
    const size = Leb128.size(rawLength);
    const out = Buffer.allocUnsafe(MAGIC.length + 1 + size + payload.length);

    MAGIC.copy(out, 0);
    out.writeUInt8(mode, MAGIC.length);
    Leb128.write(out, MAGIC.length + 1, rawLength);
    payload.copy(out, MAGIC.length + 1 + size);

    return out;
  }

  /**
   * @static
   * @method unwrap
   * @description Reads a frame, or returns null when bytes are legacy/raw.
   * @param {Buffer} buffer - Stored bytes.
   * @returns {{mode:number,rawLength:number,payload:Buffer}|null} Frame.
   */
  static unwrap(buffer) {
    if (!Buffer.isBuffer(buffer) || buffer.length < MAGIC.length + 2) return null;

    for (let i = 0; i < MAGIC.length; i++) {
      if (buffer[i] !== MAGIC[i]) return null;
    }

    const mode = buffer.readUInt8(MAGIC.length);
    const lengthInfo = Leb128.read(buffer, MAGIC.length + 1);
    const payloadStart = MAGIC.length + 1 + lengthInfo.bytesRead;

    return {
      mode,
      rawLength: lengthInfo.value,
      payload: buffer.subarray(payloadStart)
    };
  }
}

CompressionFrame.MODE_LZ = MODE_LZ;
CompressionFrame.MODE_RLE = MODE_RLE;

module.exports = CompressionFrame;
