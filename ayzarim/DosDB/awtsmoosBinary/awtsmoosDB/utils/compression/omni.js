
// B"H

/**
 * @file omni.js
 * @chapter The Squeeze Of Redundancy
 * @description
 * Omni is the common compression doorway for text and binary. It first tries a
 * custom LZ contraction, then keeps raw bytes when contraction would bloat the
 * vessel. The older bell-character shield still opens legacy scrolls.
 */

const Frame = require('./frame.js');
const TinyLz = require('./lz.js');
const Rle = require('./rle.js');

/**
 * @function escapeBell
 * @description Doubles the frame sentinel byte for legacy STRING_OMNI data.
 * @param {Buffer} raw - UTF-8 bytes.
 * @returns {Buffer} Escaped bytes.
 */
function escapeBell(raw) {
  const out = [];

  for (let i = 0; i < raw.length; i++) {
    const b = raw[i];
    out.push(b);
    if (b === 0x07) out.push(0x07);
  }

  return Buffer.from(out);
}

/**
 * @function unescapeBell
 * @description Restores the legacy doubled-bell text stream.
 * @param {Buffer} buffer - Stored bytes.
 * @returns {Buffer} Restored raw bytes.
 */
function unescapeBell(buffer) {
  const out = [];

  for (let i = 0; i < buffer.length; i++) {
    const b = buffer[i];

    if (b === 0x07 && buffer[i + 1] === 0x07) {
      out.push(0x07);
      i++;
    } else {
      out.push(b);
    }
  }

  return Buffer.from(out);
}

/**
 * @class OmniCompressor
 * @description Universal no-dependency compression gate.
 */
class OmniCompressor {
  /**
   * @static
   * @method contract
   * @description Attempts compression and returns raw when raw is smaller.
   * @param {Buffer} raw - Raw bytes.
   * @returns {{buffer:Buffer,compressed:boolean,rawBytes:number,storedBytes:number}}
   */
  static contract(raw) {
    const source = Buffer.from(raw || []);
    if (source.length === 0) {
      return { buffer: source, compressed: false, rawBytes: 0, storedBytes: 0 };
    }

    const candidates = [
      Frame.wrap(Frame.MODE_LZ, source.length, TinyLz.compress(source)),
      Frame.wrap(Frame.MODE_RLE, source.length, Rle.compress(source))
    ];

    let framed = candidates[0];

    for (let i = 1; i < candidates.length; i++) {
      if (candidates[i].length < framed.length) framed = candidates[i];
    }

    if (framed.length < source.length) {
      return {
        buffer: framed,
        compressed: true,
        rawBytes: source.length,
        storedBytes: framed.length
      };
    }

    return {
      buffer: source,
      compressed: false,
      rawBytes: source.length,
      storedBytes: source.length
    };
  }

  /**
   * @static
   * @method pack
   * @description Packs text, preserving legacy bell escaping when needed.
   * @param {string} str - Text to store.
   * @param {object} [options={}] - Compression controls.
   * @returns {Buffer} Stored bytes.
   */
  static pack(str, options = {}) {
    const raw = Buffer.from(String(str || ''), 'utf8');
    const shouldCompress = options.compress !== false;
    const contracted = shouldCompress ? this.contract(raw) : null;

    if (contracted && contracted.compressed) return contracted.buffer;
    if (raw.includes(0x07)) return escapeBell(raw);

    return raw;
  }

  /**
   * @static
   * @method packText
   * @description Packs text and reports whether compression won.
   * @param {string} str - Text to store.
   * @param {object} [options={}] - Compression controls.
   * @returns {{buffer:Buffer,compressed:boolean,rawBytes:number,storedBytes:number}}
   */
  static packText(str, options = {}) {
    const raw = Buffer.from(String(str || ''), 'utf8');
    const shouldCompress = options.compress !== false;
    const contracted = shouldCompress ? this.contract(raw) : null;

    if (contracted && contracted.compressed) return contracted;

    const buffer = raw.includes(0x07) ? escapeBell(raw) : raw;
    return {
      buffer,
      compressed: false,
      rawBytes: raw.length,
      storedBytes: buffer.length
    };
  }

  /**
   * @static
   * @method packBinary
   * @description Packs arbitrary bytes and reports compression status.
   * @param {Buffer|Uint8Array|ArrayBuffer} value - Binary source.
   * @returns {{buffer:Buffer,compressed:boolean,rawBytes:number,storedBytes:number}}
   */
  static packBinary(value) {
    return this.contract(Buffer.from(value || []));
  }

  /**
   * @static
   * @method unpackBuffer
   * @description Restores a compressed frame or returns raw legacy bytes.
   * @param {Buffer} buffer - Stored bytes.
   * @returns {Buffer} Raw bytes.
   */
  static unpackBuffer(buffer) {
    const stored = Buffer.from(buffer || []);
    const frame = Frame.unwrap(stored);

    if (!frame) return stored;
    if (frame.mode === Frame.MODE_RLE) return Rle.decompress(frame.payload, frame.rawLength);
    if (frame.mode !== Frame.MODE_LZ) return stored;

    return TinyLz.decompress(frame.payload, frame.rawLength);
  }

  /**
   * @static
   * @method unpack
   * @description Expands stored text bytes back into the original speech.
   * @param {Buffer} buffer - Stored bytes.
   * @returns {string} Restored text.
   */
  static unpack(buffer) {
    if (!buffer) return '';

    const frame = Frame.unwrap(buffer);
    const raw = frame ? this.unpackBuffer(buffer) : unescapeBell(Buffer.from(buffer));

    return raw.toString('utf8');
  }
}

module.exports = OmniCompressor;
