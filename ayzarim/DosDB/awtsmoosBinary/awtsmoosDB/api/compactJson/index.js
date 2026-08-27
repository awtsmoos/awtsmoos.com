// B"H

/**
 * @file api/compactJson/index.js
 * @chapter The Sealed Scroll Inside The Living House
 * @description
 * Native bridge for legacy AwtsmoosBinaryJSON documents.
 *
 * The raw legacy bytes are stored once with exact-byte allocation. The DB value
 * itself is a tiny binary token:
 *
 *   [format:1][flags:ULEB128][rawOffset:ULEB128][rawLength:ULEB128]
 *
 * No JSON strings are used for the token. No fixed blocks. No padding.
 */

const path = require('path');
const Leb128 = require('../../utils/leb128/scribe.js');

const FORMAT_LEGACY_AWTSMOOS_BINARY_JSON = 1;
const FLAG_IMMUTABLE_BASE = 1;

function oldBinary() {
  return require(path.join(__dirname, '..', '..', '..', 'awtsmoosBinaryJSON', 'index.js'));
}

/**
 * @class CompactJsonRef
 * @description Hydrated view over a compact binary JSON token.
 */
class CompactJsonRef {
  constructor(manager, token) {
    this.__awtsmoosCompactJsonRef = true;
    this.manager = manager;
    this.token = token;
  }

  raw() {
    return this.manager.readRaw(this.token);
  }

  keys() {
    return oldBinary().getKeys(this.raw()) || [];
  }

  get(key) {
    return oldBinary().getValueByKey(this.raw(), String(key));
  }

  map(mapping) {
    return oldBinary().mapObject(this.raw(), mapping || {});
  }

  materialize() {
    return oldBinary().deserializeBinary(this.raw());
  }

  __resolve__() {
    return this.materialize();
  }
}

/**
 * @class CompactJsonManager
 * @description Exact-byte native storage for legacy compact documents.
 */
class CompactJsonManager {
  constructor(db) {
    this.db = db;
  }

  isAwtsmoosBinary(input) {
    const raw = Buffer.isBuffer(input) ? input : Buffer.from(input || []);
    if (raw.length < 2) return false;
    const magic = raw.subarray(0, 2).toString();
    return magic === 'Aj' || magic === 'Aa';
  }

  isToken(value) {
    return !!(value && value.__awtsmoosCompactJson === true);
  }

  fromRaw(input, meta = {}) {
    const raw = Buffer.isBuffer(input) ? Buffer.from(input) : Buffer.from(input || []);
    if (!this.isAwtsmoosBinary(raw)) {
      throw new Error('B"H: compactJson.fromRaw expected legacy AwtsmoosBinaryJSON bytes');
    }

    const loc = this.db.allocator.allocate(raw.length);
    if (raw.length) this.db.pager.writeExact(loc.offset, raw);

    return {
      __awtsmoosCompactJson: true,
      format: FORMAT_LEGACY_AWTSMOOS_BINARY_JSON,
      flags: FLAG_IMMUTABLE_BASE,
      offset: loc.offset,
      length: raw.length,
      meta
    };
  }

  readRaw(token) {
    const t = this.normalizeToken(token);
    if (!t.length) return Buffer.alloc(0);
    return this.db.pager.readExact(t.offset, t.length) || Buffer.alloc(0);
  }

  ref(token) {
    return new CompactJsonRef(this, this.normalizeToken(token));
  }

  normalizeToken(token) {
    if (token instanceof CompactJsonRef) return token.token;
    if (!token || token.__awtsmoosCompactJson !== true) {
      throw new Error('B"H: expected compact Awtsmoos JSON token');
    }

    return {
      __awtsmoosCompactJson: true,
      format: Number(token.format || FORMAT_LEGACY_AWTSMOOS_BINARY_JSON),
      flags: Number(token.flags || 0),
      offset: Number(token.offset || 0),
      length: Number(token.length || 0)
    };
  }

  encodeToken(token) {
    const t = this.normalizeToken(token);
    return encodeTokenBytes(t);
  }

  decodeToken(buffer) {
    return decodeTokenBytes(buffer);
  }

  hydrateToken(buffer) {
    return this.ref(decodeTokenBytes(buffer));
  }

  static encodeTokenBytes(token) {
    return encodeTokenBytes(token);
  }

  static decodeTokenBytes(buffer) {
    return decodeTokenBytes(buffer);
  }
}

function encodeTokenBytes(token) {
  const format = Number(token.format || FORMAT_LEGACY_AWTSMOOS_BINARY_JSON) & 0xff;
  const flags = Number(token.flags || 0);
  const offset = Number(token.offset || 0);
  const length = Number(token.length || 0);

  const total = 1 + Leb128.size(flags) + Leb128.size(offset) + Leb128.size(length);
  const out = Buffer.allocUnsafe(total);
  let pos = 0;

  out[pos++] = format;
  pos += Leb128.write(out, pos, flags);
  pos += Leb128.write(out, pos, offset);
  pos += Leb128.write(out, pos, length);

  return out.subarray(0, pos);
}

function decodeTokenBytes(buffer) {
  const raw = Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer || []);
  if (raw.length < 1) {
    return {
      __awtsmoosCompactJson: true,
      format: FORMAT_LEGACY_AWTSMOOS_BINARY_JSON,
      flags: 0,
      offset: 0,
      length: 0
    };
  }

  let pos = 0;
  const format = raw[pos++];
  const flags = Leb128.read(raw, pos); pos += flags.bytesRead;
  const offset = Leb128.read(raw, pos); pos += offset.bytesRead;
  const length = Leb128.read(raw, pos);

  return {
    __awtsmoosCompactJson: true,
    format,
    flags: flags.value,
    offset: offset.value,
    length: length.value
  };
}

module.exports = CompactJsonManager;
