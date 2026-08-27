// B\"H

/**
 * @file utils/crypto/envelopeCodec.js
 * @chapter The Sealed Envelope Without JSON
 * @description
 * Compact binary codec for password-encrypted envelopes. The public envelope
 * shape stays the same for PasswordBox.open; only the stored body stops being
 * JSON text.
 */

const Leb128 = require('../leb128/scribe.js');

const MAGIC = Buffer.from('AENC');
const VERSION = 1;

function encode(envelope) {
  const e = normalize(envelope);
  const alg = Buffer.from(e.alg, 'utf8');
  const kdf = Buffer.from(e.kdf, 'utf8');
  const salt = Buffer.from(e.salt, 'base64');
  const iv = Buffer.from(e.iv, 'base64');
  const tag = Buffer.from(e.tag, 'base64');
  const body = Buffer.from(e.body, 'base64');

  let size = MAGIC.length + 1
    + Leb128.size(alg.length) + alg.length
    + Leb128.size(kdf.length) + kdf.length
    + Leb128.size(e.iters)
    + Leb128.size(salt.length) + salt.length
    + Leb128.size(iv.length) + iv.length
    + Leb128.size(tag.length) + tag.length
    + Leb128.size(body.length) + body.length;

  const out = Buffer.allocUnsafe(size);
  let pos = 0;
  MAGIC.copy(out, pos); pos += MAGIC.length;
  out[pos++] = VERSION;

  pos = writeBytes(out, pos, alg);
  pos = writeBytes(out, pos, kdf);
  pos += Leb128.write(out, pos, e.iters);
  pos = writeBytes(out, pos, salt);
  pos = writeBytes(out, pos, iv);
  pos = writeBytes(out, pos, tag);
  pos = writeBytes(out, pos, body);

  return out.subarray(0, pos);
}

function decode(raw) {
  const buffer = Buffer.isBuffer(raw) ? raw : Buffer.from(raw || []);
  if (buffer.length < MAGIC.length + 1) return null;
  if (buffer.subarray(0, MAGIC.length).compare(MAGIC) !== 0) return null;

  let pos = MAGIC.length;
  const version = buffer[pos++];
  if (version !== VERSION) throw new Error('B\"H: unsupported encrypted envelope version');

  let read = readBytes(buffer, pos); const alg = read.value.toString('utf8'); pos = read.next;
  read = readBytes(buffer, pos); const kdf = read.value.toString('utf8'); pos = read.next;
  const iters = Leb128.read(buffer, pos); pos += iters.bytesRead;
  read = readBytes(buffer, pos); const salt = read.value.toString('base64'); pos = read.next;
  read = readBytes(buffer, pos); const iv = read.value.toString('base64'); pos = read.next;
  read = readBytes(buffer, pos); const tag = read.value.toString('base64'); pos = read.next;
  read = readBytes(buffer, pos); const body = read.value.toString('base64');

  return {
    __awtsmoosEncrypted: true,
    alg,
    kdf,
    iters: iters.value,
    salt,
    iv,
    tag,
    body
  };
}

function writeBytes(out, pos, bytes) {
  pos += Leb128.write(out, pos, bytes.length);
  if (bytes.length) {
    bytes.copy(out, pos);
    pos += bytes.length;
  }
  return pos;
}

function readBytes(buffer, pos) {
  const size = Leb128.read(buffer, pos);
  pos += size.bytesRead;
  const value = buffer.subarray(pos, pos + size.value);
  return { value, next: pos + size.value };
}

function normalize(envelope) {
  if (!envelope || envelope.__awtsmoosEncrypted !== true) {
    throw new Error('B\"H: expected encrypted envelope');
  }

  return {
    alg: String(envelope.alg || 'aes-256-gcm'),
    kdf: String(envelope.kdf || 'sha256'),
    iters: Number(envelope.iters || 0),
    salt: String(envelope.salt || ''),
    iv: String(envelope.iv || ''),
    tag: String(envelope.tag || ''),
    body: String(envelope.body || '')
  };
}

module.exports = { encode, decode, MAGIC };
