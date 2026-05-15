// B\"H

/**
 * @file api/packed/liveObject.js
 * @chapter The Seed Handle That Grows Only When It Must
 * @description
 * Live read/rewrite/promote helpers for PACKED_OBJECT. The packed object
 * stays exact-byte and packed across small mutations. Only when it no
 * longer fits does it promote to a Dictionary.
 */

const SmartPointer = require('../../utils/smartPointer/index.js');
const constants = require('../../constants.js');
const Codec = require('./objectCodec.js');

function readRaw(db, ptr) {
  const dec = SmartPointer.decode(ptr);
  if (!dec || dec.type !== constants.VAL_TYPE.PACKED_OBJECT) return null;
  if (!dec.length) return Buffer.alloc(0);
  return db._readChainSafe(dec) || db.pager.readExact(dec.offset, dec.length) || Buffer.alloc(0);
}

function readObject(db, ptr) {
  const raw = readRaw(db, ptr);
  if (!raw) return null;
  return Codec.decode(raw, { db, allocator: db.allocator });
}

function keys(db, ptr) {
  const raw = readRaw(db, ptr);
  return raw ? Codec.keys(raw) : [];
}

function has(db, ptr, key) {
  const raw = readRaw(db, ptr);
  if (!raw) return false;
  return Codec.get(raw, key, { db, allocator: db.allocator }).hit;
}

function get(db, ptr, key) {
  const raw = readRaw(db, ptr);
  if (!raw) return { hit: false };
  return Codec.get(raw, key, { db, allocator: db.allocator });
}

function rewriteSet(state, key, value) {
  const obj = readObject(state.db, state.ptr) || {};
  obj[key] = value;
  return replaceWithPacked(state, obj);
}

function rewriteDelete(state, key) {
  const obj = readObject(state.db, state.ptr) || {};
  if (!Object.prototype.hasOwnProperty.call(obj, key)) return true;
  delete obj[key];
  return replaceWithPacked(state, obj);
}

function replaceWithPacked(state, obj) {
  const db = state.db;
  const raw = Codec.tryEncodePlain(obj, db.builder.scribe, {
    maxKeys: db.options.packedObjectMaxKeys || 8,
    maxBytes: db.options.packedObjectMaxBytes || 1024,
    allowNested: false
  });
  if (!raw) return false;

  const seal = db.builder.scribe.save({ __awtsmoosPackedObject: true, raw });
  state._updatePointer(seal);
  state.type = constants.VAL_TYPE.PACKED_OBJECT;
  return true;
}


/**
 * @function promoteToDictionary
 * @description Converts a packed object handle into a normal dictionary handle, in-place
 * from the caller's point of view.
 * 
 * @param {object} state - LiveHandle soul.
 * @returns {object}Dictionary engine.
 */
function promoteToDictionary(state) {
  const dict = require('../../structure/dictionary/index.js');
  const obj = readObject(state.db, state.ptr) || {};
  const engine = new dict(state.db.allocator);
  engine.create();

  for (const key of Object.keys(obj)) {
    engine.set(key, state.db.builder.build(obj[key]), { isPtr: true, assumeNew: true });
  }

  const seal = SmartPointer.toBuffer(engine.ptr);
  state._updatePointer(seal);
  state.type = constants.VAL_TYPE.DICTIONARY;
  return engine;
}

module.exports = {
  readRaw,
  readObject,
  keys,
  has,
  get,
  rewriteSet,
  rewriteDelete,
  replaceWithPacked,
  promoteToDictionary
};
