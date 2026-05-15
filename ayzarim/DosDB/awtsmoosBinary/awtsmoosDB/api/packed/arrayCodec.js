// B"H

/**
 * @file api/packed/arrayCodec.js
 * @chapter The Dense Array Before The Sequence City
 * @description
 * Exact-byte dense packet for small/medium dense arrays. Empty array == zero
 * payload bytes. Lengths 0..15 use a one-byte header; larger dense lists use
 * a compact varint header so migrated arrays of many tiny records do not
 * explode into Sequence nodes.
 */

const Leb128 = require('../../utils/leb128/scribe.js');
const constants = require('../../constants.js');
const ObjectCodec = require('./objectCodec.js');

const MAX_TINY_LEN = 15;
const MODE_VARINT_LEN = 16;
const T = constants.VAL_TYPE;

const DEFAULT_MAX_LENGTH = 2048;
const DEFAULT_MAX_BYTES = 262 * 1024;

/**
 * @function tryEncodeDense
 * @description Tries to encode a dense array as one packed packet.
 * @param {*} value - Incoming value.
 * @param {object} scribe - Primitive scribe.
 * @param {object} [options]
 * @returns {Buffer|null} Packed bytes or null.
 */
function tryEncodeDense(value, scribe, options = {}) {
  if (!Array.isArray(value)) return null;
  if (!denseNoHoles(value)) return null;

  const maxLength = Math.max(0, Number(options.maxLength || DEFAULT_MAX_LENGTH));
  if (value.length > maxLength) return null;
  if (value.length === 0) return Buffer.alloc(0);

  const entries = [];
  let size = headerSize(value.length);
  for (let i = 0; i < value.length; i++) {
    const packet = encodeInlineValue(value[i], scribe, options);
    if (!packet) return null;
    size += Leb128.size(packet.type) + Leb128.size(packet.buffer.length) + packet.buffer.length;
    entries.push(packet);
  }

  const maxBytes = Math.max(0, Number(options.maxBytes || DEFAULT_MAX_BYTES));
  if (size > maxBytes) return null;

  const out = Buffer.allocUnsafe(size);
  let pos = writeHeader(out, 0, value.length);
  for (const packet of entries) {
    pos += Leb128.write(out, pos, packet.type);
    pos += Leb128.write(out, pos, packet.buffer.length);
    packet.buffer.copy(out, pos); pos += packet.buffer.length;
  }

  return out.subarray(0, pos);
}

function encodeInlineValue(value, scribe, options) {
  if (isPlainObject(value)) {
    const raw = ObjectCodec.tryEncodePlain(value, scribe, {
      maxKeys: options.nestedObjectMaxKeys || 8,
      maxBytes: options.nestedObjectMaxBytes || 1024,
      allowNested: false
    });
    if (!raw) return null;
    return { type: T.PACKED_OBJECT, buffer: raw };
  }

  if (value && typeof value === 'object') return null;
  const packet = scribe.encode(value);
  if (!packet) return null;
  if (packet.type === T.JSON) return null;
  if (packet.type === T.NULL && value !== null) return null;
  return packet;
}

function decode(raw, context) {
  const out = [];
  for (const entry of entries(raw)) out.push(decodeEntryValue(entry, context));
  return out;
}

function get(raw, index, context) {
  const i = Number(index);
  if (!Number.isInteger(i) || i < 0) return { hit: false };
  let n = 0;
  for (const entry of entries(raw)) {
    if (n === i) return { hit: true, value: decodeEntryValue(entry, context) };
    n++;
  }
  return { hit: false };
}

function length(raw) {
  const buffer = Buffer.isBuffer(raw) ? raw : Buffer.from(raw || []);
  if (buffer.length === 0) return 0;
  return readHeader(buffer).count;
}

function* entries(raw) {
  const buffer = Buffer.isBuffer(raw) ? raw : Buffer.from(raw || []);
  if (buffer.length === 0) return;
  const header = readHeader(buffer);
  let pos = header.bytes;
  for (let i = 0; i < header.count; i++) {
    const type = Leb128.read(buffer, pos); pos += type.bytesRead;
    const valSize = Leb128.read(buffer, pos); pos += valSize.bytesRead;
    const valBuf = buffer.subarray(pos, pos + valSize.value); pos += valSize.value;
    yield { index: i, type: type.value, buffer: valBuf };
  }
}

function decodeEntryValue(entry, context) {
  if (entry.type === T.PACKED_OBJECT) return ObjectCodec.decode(entry.buffer, context);

  const Scalars = require('../liveHandle/reader/hydrator/scalars/index.js');
  const scalar = Scalars.hydrateScalar(entry.type, entry.buffer, context);
  return scalar.hit ? scalar.value : Buffer.from(entry.buffer);
}

function denseNoHoles(arr) {
  for (let i = 0; i < arr.length; i++) if (!(i in arr)) return false;
  return true;
}

function headerSize(len) {
  return len <= MAX_TINY_LEN ? 1 : 1 + Leb128.size(len);
}

function writeHeader(out, pos, len) {
  if (len <= MAX_TINY_LEN) {
    out[pos] = len;
    return 1;
  }
  out[pos++] = MODE_VARINT_LEN;
  return 1 + Leb128.write(out, pos, len);
}

function readHeader(buffer) {
  const first = buffer[0];
  if (first <= MAX_TINY_LEN) return { count: first, bytes: 1 };
  if (first !== MODE_VARINT_LEN) throw new Error('B"H: invalid packed array header');
  const count = Leb128.read(buffer, 1);
  return { count: count.value, bytes: 1 + count.bytesRead };
}

function isPlainObject(value) {
  if (!value || typeof value !== 'object') return false;
  if (Buffer.isBuffer(value) || Array.isArray(value)) return false;
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

module.exports = { tryEncodeDense, decode, get, length, entries };
