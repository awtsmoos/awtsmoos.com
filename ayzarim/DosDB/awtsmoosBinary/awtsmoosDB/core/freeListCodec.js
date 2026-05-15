// B"H

/**
 * @file core/freeListCodec.js
 * @chapter The Gaps Return Without JSON
 * @description
 * Compact binary codec for exact reusable free-ranges.
 * Format:
 *
 *   [ASFL:4][version:1][count:ULEB128] repeat [offset:ULEB128][length:ULEB128]
 *
 * No JSON strings. No padding. Only the numbers that matter.
 */

const Leb128 = require('../utils/leb128/scribe.js');

const MAGIC = Buffer.from('ASFL');
const VERSION = 1;

/**
 * @function encode
 * @description Encodes free ranges into compact binary.
 * @param {Array<{offset:number,length:number}>} ranges - Free ranges.
 * @returns {Buffer} Binary body.
 */
function encode(ranges = []) {
  const list = Array.isArray(ranges) ? ranges.filter(isGoodRange) : [];
  let size = MAGIC.length + 1 + Leb128.size(list.length);

  for (const range of list) {
    size += Leb128.size(range.offset) + Leb128.size(range.length);
  }

  const out = Buffer.allocUnsafe(size);
  let pos = 0;
  MAGIC.copy(out, pos); pos += MAGIC.length;
  out[pos++] = VERSION;
  pos += Leb128.write(out, pos, list.length);

  for (const range of list) {
    pos += Leb128.write(out, pos, range.offset);
    pos += Leb128.write(out, pos, range.length);
  }

  return out.subarray(0, pos);
}

/**
 * @function decode
 * @description Decodes a binary free-list body.
 * @param {Buffer} raw - Stored bytes.
 * @returns {Array<{offset:number,length:number}>} Free ranges.
 */
function decode(raw) {
  const buffer = Buffer.isBuffer(raw) ? raw : Buffer.from(raw || []);
  if (buffer.length < MAGIC.length + 1) return [];
  if (buffer.subarray(0, MAGIC.length).compare(MAGIC) !== 0) return null;

  let pos = MAGIC.length;
  const version = buffer[pos++];
  if (version !== VERSION) throw new Error('B"H: unsupported free-list codec version');

  const count = Leb128.read(buffer, pos);
  pos += count.bytesRead;
  const out = [];

  for (let i = 0; i < count.value; i++) {
    const offset = Leb128.read(buffer, pos); pos += offset.bytesRead;
    const length = Leb128.read(buffer, pos); pos += length.bytesRead;
    const range = { offset: offset.value, length: length.value };
    if (isGoodRange(range)) out.push(range);
  }

  return out;
}

function isGoodRange(range) {
  return range && Number.isFinite(range.offset) && Number.isFinite(range.length)
    && range.offset >= 64 && range.length > 0;
}

module.exports = { encode, decode, MAGIC };
