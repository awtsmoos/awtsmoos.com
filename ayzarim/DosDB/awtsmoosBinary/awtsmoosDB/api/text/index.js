// B"H

/**
 * @file api/text/index.js
 * @chapter The River Of Letters In Measured Cups
 * @description
 * Chunked UTF-8 text storage. Long strings become block tokens backed by blob
 * ranges, so substring and streams touch only the blocks they need.
 */

const crypto = require('crypto');

const NativeTextEncoder = global.TextEncoder || require('util').TextEncoder;
const NativeTextDecoder = global.TextDecoder || require('util').TextDecoder;

/**
 * @class TextManager
 * @description Lazy-ish text blocks with range reads and streams.
 */
class TextManager {
  /**
   * @constructor
   * @param {object} db - Database instance.
   */
  constructor(db) {
    this.db = db;
    this.TextEncoder = NativeTextEncoder;
    this.TextDecoder = NativeTextDecoder;
  }

  /**
   * @method create
   * @description Creates a chunked text token.
   * @param {string|Buffer|Uint8Array} input - Text or UTF-8 bytes.
   * @param {object} [options={}] - Text options.
   * @returns {object} Text token.
   */
  create(input = '', options = {}) {
    const decoder = new this.TextDecoder('utf-8');
    const text = Buffer.isBuffer(input) || input instanceof Uint8Array
      ? decoder.decode(input)
      : String(input);
    const chunkChars = Math.max(1, Number(options.chunkChars || 4096));
    const encoder = new this.TextEncoder();
    const blocks = [];
    let chars = 0;
    let bytes = 0;

    for (let pos = 0; pos < text.length; pos += chunkChars) {
      const slice = text.slice(pos, pos + chunkChars);
      const raw = Buffer.from(encoder.encode(slice));
      const blob = this.db.blob.create(raw, { textBlock: true });
      blocks.push({ chars: slice.length, bytes: raw.length, blob });
      chars += slice.length;
      bytes += raw.length;
    }

    return {
      __awtsmoosText: true,
      id: crypto.randomBytes(8).toString('hex'),
      chunkChars,
      chars,
      bytes,
      blocks
    };
  }

  /**
   * @method info
   * @param {object} token - Text token.
   * @returns {object} Text info.
   */
  info(token) {
    const text = this._plain(token);
    this._assertText(text);
    return {
      id: text.id,
      chars: text.chars,
      bytes: text.bytes,
      blocks: text.blocks.length,
      chunkChars: text.chunkChars
    };
  }

  /**
   * @method substring
   * @description Reads a character range without reading unrelated blocks.
   * @param {object} token - Text token.
   * @param {number} start - Start character offset.
   * @param {number} end - End character offset.
   * @returns {string} Text range.
   */
  substring(token, start = 0, end = undefined) {
    const text = this._plain(token);
    this._assertText(text);
    const from = Math.max(0, Math.min(Number(start || 0), text.chars));
    const to = end === undefined
      ? text.chars
      : Math.max(from, Math.min(Number(end || 0), text.chars));

    return this._sliceBlocks(text, from, to).join('');
  }

  /**
   * @method read
   * @description Alias for substring.
   * @param {object} token - Text token.
   * @param {number} start - Start character offset.
   * @param {number} length - Character count.
   * @returns {string} Text range.
   */
  read(token, start = 0, length = undefined) {
    const text = this._plain(token);
    const end = length === undefined ? undefined : Number(start || 0) + Number(length || 0);
    return this.substring(text, start, end);
  }

  /**
   * @method append
   * @description Appends text as new blocks and returns an updated token.
   * @param {object} token - Text token.
   * @param {string|Buffer|Uint8Array} suffix - Suffix text.
   * @returns {object} Updated text token.
   */
  append(token, suffix) {
    const text = this._plain(token);
    this._assertText(text);
    const add = this.create(suffix, { chunkChars: text.chunkChars });

    return {
      ...text,
      chars: text.chars + add.chars,
      bytes: text.bytes + add.bytes,
      blocks: text.blocks.concat(add.blocks)
    };
  }

  /**
   * @method stream
   * @description Async generator yielding text chunks for a character range.
   * @param {object} token - Text token.
   * @param {object} [options={}] - Range options.
   * @returns {AsyncGenerator<string>} Text chunks.
   */
  async *stream(token, options = {}) {
    const text = this._plain(token);
    this._assertText(text);
    const start = Math.max(0, Number(options.start || 0));
    const end = options.end === undefined ? text.chars : Number(options.end || 0);

    for (const piece of this._sliceBlocks(text, start, end)) {
      yield piece;
    }
  }

  /**
   * @method _sliceBlocks
   * @param {object} text - Text token.
   * @param {number} from - Start char.
   * @param {number} to - End char.
   * @returns {Array<string>} Pieces.
   */
  _sliceBlocks(text, from, to) {
    const decoder = new this.TextDecoder('utf-8');
    const out = [];
    let cursor = 0;

    for (const block of text.blocks) {
      const blockStart = cursor;
      const blockEnd = cursor + block.chars;
      cursor = blockEnd;
      if (blockEnd <= from) continue;
      if (blockStart >= to) break;

      const raw = this.db.blob.read(block.blob, 0, block.bytes);
      const value = decoder.decode(raw);
      out.push(value.slice(Math.max(0, from - blockStart), Math.min(block.chars, to - blockStart)));
    }

    return out;
  }

  /**
   * @method _plain
   * @param {*} value - Possible live handle.
   * @returns {*} Plain token.
   */
  _plain(value) {
    return value && value.__resolve__ ? value.__resolve__() : value;
  }

  /**
   * @method _assertText
   * @param {object} token - Text token.
   * @returns {void}
   */
  _assertText(token) {
    if (!token || token.__awtsmoosText !== true || !Array.isArray(token.blocks)) {
      throw new Error('B"H: Expected an Awtsmoos text token');
    }
  }
}

module.exports = TextManager;
