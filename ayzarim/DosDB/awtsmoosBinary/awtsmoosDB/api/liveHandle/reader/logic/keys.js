// B"H

/**
 * @file api/liveHandle/reader/logic/keys.js
 * @chapter The Keys Speak Without Noise
 * @description
 * Key generation must be silent. Debug logs inside hot readers slow tests and
 * pollute failures. This module yields keys only.
 */

const constants = require('../../../../constants.js');
const SequenceEngine = require('../../../../structure/sequence/index.js');
const DictionaryEngine = require('../../../../structure/dictionary/index.js');
const MapEngine = require('../../../../structure/map/index.js');
const FlatObject = require('../../../../structure/flat/object/index.js');
const keyEncoding = require('../../../../utils/keyEncoding.js');
const PackedLive = require('../../../../api/packed/liveObject.js');
const PackedArray = require('../../../../api/packed/liveArray.js');
const SmartPointer = require('../../../../utils/smartPointer/index.js');

const T = constants.VAL_TYPE;

function* sequenceKeys(allocator, ptr) {
  const engine = new SequenceEngine(allocator, ptr);
  const length = engine.length();
  for (let i = 0; i < length; i++) yield i;
}

function* dictionaryKeys(allocator, ptr) {
  const engine = new DictionaryEngine(allocator, ptr);
  for (const key of engine.keys()) yield key;
}

function* sortedMapKeys(allocator, ptr) {
  const engine = new MapEngine(allocator, ptr);
  for (const item of engine.range()) yield keyEncoding.decode(item.key);
}

function* flatObjectKeys(allocator, ptr) {
  const engine = new FlatObject(allocator, ptr);
  for (const key of engine.keys()) yield key;
}

function* packedObjectKeys(allocator, ptr) {
  for (const key of PackedLive.keys(allocator.db, SmartPointer.toBuffer(ptr))) yield key;
}

function* packedArrayKeys(allocator, ptr) {
  for (const key of PackedArray.keys(allocator.db, SmartPointer.toBuffer(ptr))) yield key;
}

/**
 * @function generate
 * @description
 * Yields keys for a handle.
 *
 * @param {object} handle - Internal handle state.
 * @param {object} db - DB instance.
 * @yields {string|number} Key.
 */
function* generate(handle, db) {
  handle.ensureResolved();

  const ptr = handle.nav.resolveStructPtr();
  if (!ptr) return;

  const type = handle.type === T.ANCHOR
    ? (handle.nav.resolveAnchorInnerType() || T.DICTIONARY)
    : handle.type;

  const strategies = {
    [T.SEQUENCE]: sequenceKeys,
    [T.ARRAY]: sequenceKeys,
    [T.SMART_ARRAY]: sequenceKeys,
    [T.SET]: sequenceKeys,
    [T.JS_SET]: sequenceKeys,
    [T.DICTIONARY]: dictionaryKeys,
    [T.OBJECT]: dictionaryKeys,
    [T.MAP]: sortedMapKeys,
    [T.JS_MAP]: sortedMapKeys,
    [T.SMART_OBJECT]: flatObjectKeys,
    [T.PACKED_OBJECT]: packedObjectKeys,
    [T.PACKED_ARRAY]: packedArrayKeys
  };

  const strategy = strategies[type] || dictionaryKeys;
  yield* strategy(db.allocator, ptr);
}

module.exports = {
  generate
};
