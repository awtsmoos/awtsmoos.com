// B"H

/**
 * @file core/freeListCodec.js
 * @chapter The Gaps Return Without JSON
 * @description Compact binary codec for exact reusable free-ranges:
 * [ASFL:4][version:1][count:ULEB128] then [offset:ULEB128][length:ULEB128]
 * per range. No JSON, no padding. Version 2 (engine-fix 2026-10-20, E8)
 * appends a fixed 28-byte trust trailer: [anchorFnv1a64:8][cursor:8]
 * [freeBytes:8][fnv1a32 checksum over all preceding bytes:4]. The anchor
 * hashes the root anchor BODY, which changes on every graph mutation
 * under copy-on-write; a loader whose current anchor + cursor + freeBytes
 * match the token may trust the persisted list without a graph verify.
 * Version-1 bodies (and bad-checksum v2) decode with token === undefined
 * and are validated the classic way. Old engines throw on version 2,
 * which their loader already converts into an empty (safe) free list.
 */

const Leb128 = require('../utils/leb128/scribe.js');

const MAGIC = Buffer.from('ASFL');
const VERSION = 1;
const VERSION_TOKEN = 2;
const TRAILER_LENGTH = 28;

/** FNV-1a 32-bit checksum (corruption detection) over a Buffer. */
function fnv1a32(buffer) {
  let hash = 0x811c9dc5;
  for (let i = 0; i < buffer.length; i++) {
    hash ^= buffer[i];
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

/** FNV-1a 64-bit fingerprint of a Buffer, as 8 big-endian bytes. */
function fnv1a64(buffer) {
  let hash = 0xcbf29ce484222325n;
  const mask = 0xffffffffffffffffn;
  for (let i = 0; i < buffer.length; i++) {
    hash ^= BigInt(buffer[i]);
    hash = (hash * 0x100000001b3n) & mask;
  }
  const out = Buffer.alloc(8);
  out.writeBigUInt64BE(hash, 0);
  return out;
}

/**
 * Encodes free ranges into compact binary. With a token
 * ({anchor: Buffer(8), cursor, freeBytes}) the body is version 2 and
 * carries the fixed-size trust trailer.
 */
function encode(ranges = [], token = null) {
  const list = Array.isArray(ranges) ? ranges.filter(isGoodRange) : [];
  let size = MAGIC.length + 1 + Leb128.size(list.length);
  for (const range of list) {
    size += Leb128.size(range.offset) + Leb128.size(range.length);
  }
  if (token) size += TRAILER_LENGTH;
  const out = Buffer.allocUnsafe(size);
  let pos = 0;
  MAGIC.copy(out, pos); pos += MAGIC.length;
  out[pos++] = token ? VERSION_TOKEN : VERSION;
  pos += Leb128.write(out, pos, list.length);
  for (const range of list) {
    pos += Leb128.write(out, pos, range.offset);
    pos += Leb128.write(out, pos, range.length);
  }
  if (token) {
    token.anchor.copy(out, pos); pos += 8;
    out.writeBigUInt64BE(BigInt(token.cursor), pos); pos += 8;
    out.writeBigUInt64BE(BigInt(token.freeBytes), pos); pos += 8;
    out.writeUInt32BE(fnv1a32(out.subarray(0, pos)), pos); pos += 4;
  }
  return out.subarray(0, pos);
}

/** Decodes a binary free-list body; v2 success attaches out.token. */
function decode(raw) {
  const buffer = Buffer.isBuffer(raw) ? raw : Buffer.from(raw || []);
  if (buffer.length < MAGIC.length + 1) return [];
  if (buffer.subarray(0, MAGIC.length).compare(MAGIC) !== 0) return null;
  let pos = MAGIC.length;
  const version = buffer[pos++];
  if (version !== VERSION && version !== VERSION_TOKEN) {
    throw new Error('B"H: unsupported free-list codec version');
  }
  const count = Leb128.read(buffer, pos);
  pos += count.bytesRead;
  const out = [];
  for (let i = 0; i < count.value; i++) {
    const offset = Leb128.read(buffer, pos); pos += offset.bytesRead;
    const length = Leb128.read(buffer, pos); pos += length.bytesRead;
    const range = { offset: offset.value, length: length.value };
    if (isGoodRange(range)) out.push(range);
  }
  if (version === VERSION_TOKEN) {
    const trailerAt = buffer.length - TRAILER_LENGTH;
    if (trailerAt < pos) return null;
    const stored = buffer.readUInt32BE(trailerAt + 24);
    if (fnv1a32(buffer.subarray(0, trailerAt + 24)) !== stored) return null;
    out.token = {
      anchor: Buffer.from(buffer.subarray(trailerAt, trailerAt + 8)),
      cursor: Number(buffer.readBigUInt64BE(trailerAt + 8)),
      freeBytes: Number(buffer.readBigUInt64BE(trailerAt + 16))
    };
  }
  return out;
}

function isGoodRange(range) {
  return range && Number.isFinite(range.offset) && Number.isFinite(range.length)
    && range.offset >= 64 && range.length > 0;
}

module.exports = { encode, decode, MAGIC, fnv1a64 };
