// B\"H

/**
 * @file api/packed/objectCodec.js
 * @chapter The Seed House Before The City
 * @description
 * Compact exact-byte layout for small plain objects. New writes have
 * no per-object magic/padding header at all: the pointer type already says
 * PACKED_OBJECT. Old APOB packets still decode.
*
 * New tiny format:
 *   [count:1 byte 0-15] repeat [keyLen:ULEB128][keyBytes][valType:ULEB128][valLen:ULEB128][valBytes]
 *   empty object == zero-length payload
 */

const Leb128 = require('../../utils/leb128/scribe.js');
const constants = require('../../constants.js');

const LEGACY_MAGIC = Buffer.from('APOB');
const LEGACY_VERSION = 1;
const MAXTINYCOUNT = 15;
const T = constants.VAL_TYPE;

const DEFAULT_MAX_KEYS = 8;
const DEFAULT_MAX_BYTES = 1024;

/**
 * @function tryEncodePlain
 * @description Tries to encode a plain object as a small packed object.
 * @param {*} value - Incoming value.
 * @param {object} scribe - Primitive scribe.
 * @param {object} [options]
 * @returns {Buffer|null} Packed bytes or null when not safe to pack.
 */
function tryEncodePlain(value, scribe, options = {}) {
  if (!isPlainObject(value)) return null;
  const seen = options._seen || (options._seen = new WeakSet());
  if (seen.has(value)) return null;
  seen.add(value);

  const keys = Object.keys(value);
  const maxKeys = Math.max(0, Number(options.maxKeys || DEFAULT_MAX_KEYS));
  if (keys.length > maxKeys || keys.length > MAXTINYCOUNT) return null;
  if (keys.length === 0) return Buffer.alloc(0);

  const entries = [];
  let size = 1;

  for (const key of keys) {
    const keyBytes = Buffer.from(key, 'utf8');
    const packet = encodeInlineValue(value[key], scribe, options);
    if (!packet) return null;

    size += Leb128.size(keyBytes.length) + keyBytes.length
      + Leb128.size(packet.type)
      + Leb128.size(packet.buffer.length) + packet.buffer.length;
    entries.push({ keyBytes, packet });
  }

  const maxBytes = Math.max(0, Number(options.maxBytes || DEFAULT_MAX_BYTES ));
  if (size > maxBytes) return null;

  const out = Buffer.allocUnsafe(size);
  let pos = 0;
  out[pos++] = entries.length;

  for (const entry of entries) {
    pos += Leb128.write(out, pos, entry.keyBytes.length);
    entry.keyBytes.copy(out, pos); pos += entry.keyBytes.length;
    pos += Leb128.write(out, pos, entry.packet.type);
    pos += Leb128.write(out, pos, entry.packet.buffer.length);
    entry.packet.buffer.copy(out, pos); pos += entry.packet.buffer.length;
  }

  return out.subarray(0, pos);
}

function encodeInlineValue(value, scribe, options) {
  if (isPlainObject(value)) {
    if (options.allowNested !== true) return null;
    const nested = tryEncodePlain(value, scribe, {
      maxKeys: Math.min(4, Number(options.nestedMaxKeys ?? 4)),
      maxBytes: Math.min(256, Number(options.nestedMaxBytes ?? 256)),
      allowNested: true,
      _seen: options._seen
    });
    if (!nested) return null;
    return { type: T.PACKED_OBJECT, buffer: nested };
  }

  const packet = scribe.encode(value);
  if (!packet) return null;
  if (packet.type === T.JSON) return null;
  if (packet.type === T.NULL && value !== null) return null;
  return packet;
}

function decode(raw, context) {
  const out = {};
  for (const entry of entries(raw)) out[entry.key] = decodeEntryValue(entry, context);
  return out;
}

function get(raw, key, context) {
  for (const entry of entries(raw)) {
    if (entry.key === String(key)) return { hit: true, value: decodeEntryValue(entry, context) };
  }

  return { hit: false };
}

function keys(raw) {
  const out = [];
  for (const entry of entries(raw)) out.push(entry.key);
  return out;
}

function* entries(raw) {
  const buffer = Buffer.isBuffer(raw) ? raw : Buffer.from(raw || []);
  if (buffer.length === 0) return;

  let pos = 0;
  let count;
  if (buffer.length >= LEGACY_MAGIC.length + 1 && buffer.subarray(0, LEGACY_MAGIC.length).compare(LEGACY_MAGIC) === 0) {
    pos = LEGACY_MAGIC.length;
    const version = buffer[pos++];
    if (version !== LEGACY_VERSION) throw new Error('B\"H: unsupported packed object version');
    const decodedCount = Leb128.read(buffer, pos);
    count = decodedCount.value;
    pos += decodedCount.bytesRead;
  } else {
    count = buffer[pos++];
    if (count > MAXTINYCOUNT) throw new Error('B\"H: invalid packed object tiny header');
  }

  for (let i = 0; i < count; i++) {
    const keySize = Leb128.read(buffer, pos); pos += keySize.bytesRead;
    const key = buffer.subarray(pos, pos + keySize.value).toString('utf8'); pos += keySize.value;
    const type = Leb128.read(buffer, pos); pos += type.bytesRead;
    const valSize = Leb128.read(buffer, pos); pos += valSize.bytesRead;
    const valBuf = buffer.subarray(pos, pos + valSize.value); pos += valSize.value;
    yield { key, type: type.value, buffer: valBuf };
  }
}

function decodeEntryValue(entry, context) {
  if (entry.type === T.PACKED_OBJECT) return decode(entry.buffer, context);
  const Scalars = require('../liveHandle/reader/hydrator/scalars/index.js');
  const scalar = Scalars.hydrateScalar(entry.type, entry.buffer, context);
  return scalar.hit ? scalar.value : Buffer.from(entry.buffer);
}

function isPlainObject(value) {
  if (!value || typeof value !== 'object') return false;
  if (Buffer.isBuffer(value)) return false;
  if (Array.isArray(value)) return false;
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

module.exports = { tryEncodePlain, decode, get, keys, entries, MAGIC: LEGACY_MAGIC };
