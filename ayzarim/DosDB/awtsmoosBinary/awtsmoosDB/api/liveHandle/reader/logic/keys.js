// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file api/liveHandle/reader/logic/keys.js
 * @chapter The Keys Speak From Their True Chambers
 * @description
 * Enumerates structural keys without hydration. Anchored sequences reveal their
 * numeric positions first and then the named metadata held beside the moving
 * sequence root. The Awtsmoos gives every key its proper vessel and no noise.
 */

const constants = require('../../../../constants.js');
const SequenceEngine = require('../../../../structure/sequence/index.js');
const DictionaryEngine = require('../../../../structure/dictionary/index.js');
const AnchorMetadata = require('../../../../structure/anchor/metadata.js');
const MapEngine = require('../../../../structure/map/index.js');
const FlatObject = require('../../../../structure/flat/object/index.js');
const keyEncoding = require('../../../../utils/keyEncoding.js');
const PackedLive = require('../../../../api/packed/liveObject.js');
const PackedArray = require('../../../../api/packed/liveArray.js');
const SmartPointer = require('../../../../utils/smartPointer/index.js');

const TYPES = constants.VAL_TYPE;

function* sequenceKeys(allocator, pointer, handle) {
	const engine = new SequenceEngine(allocator, pointer);
	for (let index = 0; index < engine.length(); index++) yield index;
	if (handle.type !== TYPES.ANCHOR || !handle.ptr) return;
	const metadata = new AnchorMetadata(allocator.db, handle.ptr);
	yield* metadata.keys();
}

function* dictionaryKeys(allocator, pointer) {
	const engine = new DictionaryEngine(allocator, pointer);
	yield* engine.keys();
}

function* sortedMapKeys(allocator, pointer) {
	const engine = new MapEngine(allocator, pointer);
	for (const item of engine.range()) yield keyEncoding.decode(item.key);
}

function* flatObjectKeys(allocator, pointer) {
	const engine = new FlatObject(allocator, pointer);
	yield* engine.keys();
}

function* packedObjectKeys(allocator, pointer) {
	yield* PackedLive.keys(allocator.db, SmartPointer.toBuffer(pointer));
}

function* packedArrayKeys(allocator, pointer) {
	yield* PackedArray.keys(allocator.db, SmartPointer.toBuffer(pointer));
}

function* generate(handle, database) {
	handle.ensureResolved();
	const pointer = handle.nav.resolveStructPtr();
	if (!pointer) return;

	const type = handle.type === TYPES.ANCHOR
		? (handle.nav.resolveAnchorInnerType() || TYPES.DICTIONARY)
		: handle.type;
	const strategies = {
		[TYPES.SEQUENCE]: sequenceKeys,
		[TYPES.ARRAY]: sequenceKeys,
		[TYPES.SMART_ARRAY]: sequenceKeys,
		[TYPES.SET]: sequenceKeys,
		[TYPES.JS_SET]: sequenceKeys,
		[TYPES.DICTIONARY]: dictionaryKeys,
		[TYPES.OBJECT]: dictionaryKeys,
		[TYPES.MAP]: sortedMapKeys,
		[TYPES.JS_MAP]: sortedMapKeys,
		[TYPES.SMART_OBJECT]: flatObjectKeys,
		[TYPES.PACKED_OBJECT]: packedObjectKeys,
		[TYPES.PACKED_ARRAY]: packedArrayKeys
	};
	const strategy = strategies[type] || dictionaryKeys;
	yield* strategy(database.allocator, pointer, handle);
}

module.exports = {
	generate
};
