// B"H
const { ByteWriter } = require('./ByteWriter.js');
const { ByteReader } = require('./ByteReader.js');
const { writeText, readText } = require('./Mode2ValueCodec.js');
const KIND = Object.freeze({ RAW: 0, PREFIX_DELTA: 1 });
function commonPrefix(a = '', b = '') {
  let i = 0;
  while (i < a.length && i < b.length && a[i] === b[i]) i++;
  return i;
}
function encodeRaw(pool = []) {
  const w = new ByteWriter();
  w.varUint(pool.length);
  for (const s of pool) writeText(w, s);
  return w.toBuffer();
}
function decodeRaw(r) {
  const n = r.varUint(), pool = [];
  for (let i = 0; i < n; i++) pool.push(readText(r));
  return pool;
}
function encodePrefixDelta(pool = []) {
  const w = new ByteWriter();
  w.varUint(pool.length);
  let prev = '';
  for (const s of pool) {
    const p = commonPrefix(prev, s);
    const suffix = s.slice(p);
    w.varUint(p);
    writeText(w, suffix);
    prev = s;
  }
  return w.toBuffer();
}
function decodePrefixDelta(r) {
  const n = r.varUint(), pool = [];
  let prev = '';
  for (let i = 0; i < n; i++) {
    const prefix = r.varUint();
    const s = prev.slice(0, prefix) + readText(r);
    pool.push(s);
    prev = s;
  }
  return pool;
}
function writePoolSmart(w, pool = []) {
  const raw = encodeRaw(pool), delta = encodePrefixDelta(pool);
  if (delta.length < raw.length) w.u8(KIND.PREFIX_DELTA).raw(delta);
  else w.u8(KIND.RAW).raw(raw);
  return { kind: delta.length < raw.length ? 'PREFIX_DELTA' : 'RAW', rawBytes: raw.length, deltaBytes: delta.length };
}
function readPoolSmart(r) {
  const kind = r.u8();
  if (kind === KIND.RAW) return decodeRaw(r);
  if (kind === KIND.PREFIX_DELTA) return decodePrefixDelta(r);
  throw new Error(`Bad pool encoding kind ${kind}`);
}
function choosePoolEncoding(pool = []) {
  const raw = encodeRaw(pool), delta = encodePrefixDelta(pool);
  return delta.length + 1 < raw.length ? { version: 4, kind: KIND.PREFIX_DELTA, bytes: delta, rawBytes: raw.length, deltaBytes: delta.length }
    : { version: 3, kind: KIND.RAW, bytes: raw, rawBytes: raw.length, deltaBytes: delta.length };
}
module.exports = { KIND, commonPrefix, encodeRaw, encodePrefixDelta, choosePoolEncoding, writePoolSmart, readPoolSmart };
