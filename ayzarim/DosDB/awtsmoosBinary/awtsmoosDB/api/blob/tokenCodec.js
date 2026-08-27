// B"H

/**
 * @file api/blob/tokenCodec.js
 * @chapter The Blob Token Without JSON
 * @description
 * Binary codec for blob metadata tokens. Blob bodies are exact-byte
 * allocations elsewhere; this packet only points to them.
 */

const path = require('path');
const Leb128 = require('../../utils/leb128/scribe.js');

const MAGIC = Buffer.from('ABLB');
const VERSION = 1;

function oldBinary() {
  return require(path.join(__dirname, '..', '..', '..', 'awtsmoosBinaryJSON', 'index.js'));
}

function encode(blob) {
  const b = normalize(blob);
  const id = Buffer.from(b.id || '', 'utf8');
  const metaRaw = hasMeta(b.meta) ? Buffer.from(oldBinary().serializeJSON(b.meta)) : Buffer.alloc(0);

  let size = MAGIC.length + 1
    + Leb128.size(b.offset) + Leb128.size(b.length)
    + Leb128.size(id.length) + id.length
    + Leb128.size(metaRaw.length) + metaRaw.length;

  const out = Buffer.allocUnsafe(size);
  let pos = 0;
  MAGIC.copy(out, pos); pos += MAGIC.length;
  out[pos++] = VERSION;
  pos += Leb128.write(out, pos, b.offset);
  pos += Leb128.write(out, pos, b.length);
  pos += Leb128.write(out, pos, id.length);
  if (id.length) { id.copy(out, pos); pos += id.length; }
  pos += Leb128.write(out, pos, metaRaw.length);
  if (metaRaw.length) { metaRaw.copy(out, pos); pos += metaRaw.length; }

  return out.subarray(0, pos);
}

function decode(raw) {
  const buffer = Buffer.isBuffer(raw) ? raw : Buffer.from(raw || []);
  if (buffer.length < MAGIC.length + 1) return null;
  if (buffer.subarray(0, MAGIC.length).compare(MAGIC) !== 0) return null;

  let pos = MAGIC.length;
  const version = buffer[pos++];
  if (version !== VERSION) throw new Error('B"H: unsupported blob token version');

  const offset = Leb128.read(buffer, pos); pos += offset.bytesRead;
  const length = Leb128.read(buffer, pos); pos += length.bytesRead;
  const idSize = Leb128.read(buffer, pos); pos += idSize.bytesRead;
  const id = buffer.subarray(pos, pos + idSize.value).toString('utf8'); pos += idSize.value;
  const metaSize = Leb128.read(buffer, pos); pos += metaSize.bytesRead;
  const metaRaw = buffer.subarray(pos, pos + metaSize.value);

  let meta = {};
  if (metaRaw.length) {
    meta = oldBinary().deserializeBinary(metaRaw) || {};
  }

  return {
    __awtsmoosBlob: true,
    id,
    offset: offset.value,
    length: length.value,
    meta
  };
}

function normalize(blob) {
  if (!blob || blob.__awtsmoosBlob !== true) throw new Error('B"H: expected blob token');
  return {
    id: String(blob.id || ''),
    offset: Number(blob.offset || 0),
    length: Number(blob.length || 0),
    meta: blob.meta || {}
  };
}

function hasMeta(meta) {
  return meta && typeof meta === 'object' && Object.keys(meta).length > 0;
}

module.exports = { encode, decode, MAGIC };
