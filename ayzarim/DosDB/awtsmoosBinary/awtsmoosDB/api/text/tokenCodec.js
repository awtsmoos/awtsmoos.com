// B\"H

/**
 * @file api/text/tokenCodec.js
 * @chapter The Text Token Without JSON
 * @description
 * Binary codec for chunked text metadata. The actual text bytes live in blob bodies;
 * this token stores only compact counters and compact blob tokens for each block.
 */

const Leb128 = require('../../utils/leb128/scribe.js');
const BlobToken = require('../blob/tokenCodec.js');

const MAGIC = Buffer.from('ATXT');
const VERSION = 1;

/**
 * @function encode
 * @description Encodes a chunked text token as compact binary.
 * @param {object} token - Awtsmoos text token.
 * @returns {Buffer} Binary token.
 */
function encode(token) {
  const text = normalize(token);
  const id = Buffer.from(text.id || '', 'utf8');
  const blocks = Array.isArray(text.blocks) ? text.blocks : [];
  const encodedBlocks = blocks.map(block => ({
    chars: Number(block.chars || 0),
    bytes: Number(block.bytes || 0),
    blob: BlobToken.encode(block.blob)
  }));

  let size = MAGIC.length + 1
    + Leb128.size(id.length) + id.length
    + Leb128.size(text.chunkChars)
    + Leb128.size(text.chars)
    + Leb128.size(text.bytes)
    + Leb128.size(encodedBlocks.length);

  for (const block of encodedBlocks) {
    size += Leb128.size(block.chars)
      + Leb128.size(block.bytes)
      + Leb128.size(block.blob.length)
      + block.blob.length;
  }

  const out = Buffer.allocUnsafe(size);
  let pos = 0;
  MAGIC.copy(out, pos); pos += MAGIC.length;
  out[pos++] = VERSION;
  pos += Leb128.write(out, pos, id.length);
  if (id.length) { id.copy(out, pos); pos += id.length; }
  pos += Leb128.write(out, pos, text.chunkChars);
  pos += Leb128.write(out, pos, text.chars);
  pos += Leb128.write(out, pos, text.bytes);
  pos += Leb128.write(out, pos, encodedBlocks.length);

  for (const block of encodedBlocks) {
    pos += Leb128.write(out, pos, block.chars);
    pos += Leb128.write(out, pos, block.bytes);
    pos += Leb128.write(out, pos, block.blob.length);
    block.blob.copy(out, pos); pos += block.blob.length;
  }

  return out.subarray(0, pos);
}

/**
 * @function decode
 * @description Decodes compact binary text metadata, or returns null for legacy JSON.
 * @param {Buffer} raw - Stored bytes.
 * @returns {object|null} Text token or null.
 */
function decode(raw) {
  const buffer = Buffer.isBuffer(raw) ? raw : Buffer.from(raw || []);
  if (buffer.length < MAGIC.length + 1) return null;
  if (buffer.subarray(0, MAGIC.length).compare(MAGIC) !== 0) return null;

  let pos = MAGIC.length;
  const version = buffer[pos++];
  if (version !== VERSION) throw new Error('B\"H: unsupported text token version');

  const idSize = Leb128.read(buffer, pos); pos += idSize.bytesRead;
  const id = buffer.subarray(pos, pos + idSize.value).toString('utf8'); pos += idSize.value;
  const chunkChars = Leb128.read(buffer, pos); pos += chunkChars.bytesRead;
  const chars = Leb128.read(buffer, pos); pos += chars.bytesRead;
  const bytes = Leb128.read(buffer, pos); pos += bytes.bytesRead;
  const blockCount = Leb128.read(buffer, pos); pos += blockCount.bytesRead;
  const blocks = [];

  for (let i = 0; i < blockCount.value; i++) {
    const blockChars = Leb128.read(buffer, pos); pos += blockChars.bytesRead;
    const blockBytes = Leb128.read(buffer, pos); pos += blockBytes.bytesRead;
    const blobSize = Leb128.read(buffer, pos); pos += blobSize.bytesRead;
    const blobRaw = buffer.subarray(pos, pos + blobSize.value); pos += blobSize.value;
    blocks.push({
      chars: blockChars.value,
      bytes: blockBytes.value,
      blob: BlobToken.decode(blobRaw)
    });
  }

  return {
    __awtsmoosText: true,
    id,
    chunkChars: chunkChars.value,
    chars: chars.value,
    bytes: bytes.value,
    blocks
  };
}

function normalize(token) {
  if (!token || token.__awtsmoosText !== true) throw new Error('B\"H: expected text token');
  return {
    id: String(token.id || ''),
    chunkChars: Number(token.chunkChars || 0),
    chars: Number(token.chars || 0),
    bytes: Number(token.bytes || 0),
    blocks: Array.isArray(token.blocks) ? token.blocks : []
  };
}

module.exports = { encode, decode, MAGIC };
