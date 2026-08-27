// B"H

/**
 * @file api/packed/liveArray.js
 * @chapter The Tiny Array Handle That Grows Only When Needed
 * @description
 * Live read/rewrite/promote helpers for PACKED_ARRAY.
 */

const SmartPointer = require('../../utils/smartPointer/index.js');
const constants = require('../../constants.js');
const Codec = require('./arrayCodec.js');

function readRaw(db, ptr) {
  const dec = SmartPointer.decode(ptr);
  if (!dec || dec.type !== constants.VAL_TYPE.PACKED_ARRAY) return null;
  if (!dec.length) return Buffer.alloc(0);
  return db._readChainSafe(dec) || db.pager.readExact(dec.offset, dec.length) || Buffer.alloc(0);
}

function readArray(db, ptr) {
  const raw = readRaw(db, ptr);
  if (!raw) return null;
  return Codec.decode(raw, { db, allocator: db.allocator });
}

function length(db, ptr) {
  const raw = readRaw(db, ptr);
  return raw ? Codec.length(raw) : 0;
}

function get(db, ptr, key) {
  if (String(key) === 'length') return { hit: true, value: length(db, ptr) };
  const raw = readRaw(db, ptr);
  if (!raw) return { hit: false };
  return Codec.get(raw, key, { db, allocator: db.allocator });
}

function keys(db, ptr) {
  const len = length(db, ptr);
  const out = [];
  for (let i = 0; i < len; i++) out.push(i);
  return out;
}

function rewriteSet(state, key, value) {
  const index = Number(key);
  if (!Number.isInteger(index) || index < 0) return false;
  const arr = readArray(state.db, state.ptr) || [];
  if (index > arr.length) return false;
  arr[index] = value;
  return replaceWithPacked(state, arr);
}

function rewritePush(state, value) {
  const arr = readArray(state.db, state.ptr) || [];
  arr.push(value);
  return replaceWithPacked(state, arr) ? arr.length : false;
}

function rewriteDelete(state, key) {
  const index = Number(key);
  if (!Number.isInteger(index) || index < 0) return false;
  const arr = readArray(state.db, state.ptr) || [];
  if (index >= arr.length) return true;
  arr.splice(index, 1);
  return replaceWithPacked(state, arr);
}

function replaceWithPacked(state, arr) {
  const db = state.db;
  const raw = Codec.tryEncodeDense(arr, db.builder.scribe, {
    maxLength: db.options.packedArrayMaxLength || 15,
    maxBytes: db.options.packedArrayMaxBytes || 1024
  });
  if (!raw) return false;

  const seal = db.builder.scribe.save({ __awtsmoosPackedArray: true, raw });
  state._updatePointer(seal);
  state.type = constants.VAL_TYPE.PACKED_ARRAY;
  return true;
}

function promoteToSequence(state) {
  const Sequence = require('../../structure/sequence/index.js');
  const arr = readArray(state.db, state.ptr) || [];
  const engine = new Sequence(state.db.allocator);
  engine.create();

  for (const value of arr) {
    engine.push(state.db.builder.build(value));
  }

  const seal = SmartPointer.toBuffer(engine.ptr);
  state._updatePointer(seal);
  state.type = constants.VAL_TYPE.SEQUENCE;
  return engine;
}

module.exports = {
  readRaw,
  readArray,
  length,
  get,
  keys,
  rewriteSet,
  rewritePush,
  rewriteDelete,
  replaceWithPacked,
  promoteToSequence
};
