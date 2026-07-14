// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file api/vector/reindex/sourceIterator.js
 * @chapter Every Native Vessel Is Opened By Its Declared Type
 * @description
 * Chooses a physical iterator from the resolved structure type, never from an
 * incidental property on a decoded seal. A Map seal is not a plain object merely
 * because it is represented as {offset,length,type}. The Awtsmoos reveals each
 * record through the engine that truly owns its key and payload pointer.
 */

const constants = require('../../../constants.js');
const SmartPointer = require('../../../utils/smartPointer.js');
const Sequence = require('../../../structure/sequence/index.js');
const MapEngine = require('../../../structure/map/index.js');
const DictionaryEngine = require('../../../structure/dictionary/index.js');
const toKeyBytes = require('../../../structure/dictionary/logic/keyBytes.js');
const PackedArray = require('../../packed/liveArray.js');

function createSourceIterator(db, soul) {
	const type = resolvedType(soul);
	const pointer = soul.nav.resolveStructPtr();
	const types = constants.VAL_TYPE;
	if (!pointer) return null;

	if ([types.SEQUENCE, types.ARRAY, types.SET, types.JS_SET].includes(type)) {
		return iterateSequence(new Sequence(db.allocator, pointer));
	}
	if (type === types.PACKED_ARRAY) {
		return iteratePackedArray(db, pointer);
	}
	if (type === types.MAP || type === types.JS_MAP) {
		return iterateMap(new MapEngine(db.allocator, pointer));
	}
	if (type === types.DICTIONARY || type === types.OBJECT) {
		return iterateDictionary(new DictionaryEngine(db.allocator, pointer));
	}
	if (isPlainObject(pointer)) return iterateObject(pointer);
	return null;
}

function resolvedType(soul) {
	const types = constants.VAL_TYPE;
	if (soul.type !== types.ANCHOR) return soul.type;
	return soul.nav.resolveAnchorInnerType() || soul.type;
}

function* iterateSequence(engine) {
	for (let index = 0; index < engine.length(); index++) {
		yield { key: index, pointer: engine.getPtr(index), value: undefined };
	}
}

function* iterateMap(engine) {
	for (const row of engine.range()) {
		yield { key: row.key.toString('utf8'), pointer: row.ptr, value: undefined };
	}
}

function* iterateDictionary(engine) {
	for (const key of engine.keys()) {
		yield { key, pointer: engine.getPtr(toKeyBytes(key)), value: undefined };
	}
}

function* iteratePackedArray(db, pointer) {
	const values = PackedArray.readArray(db, SmartPointer.toBuffer(pointer)) || [];
	for (let index = 0; index < values.length; index++) {
		const value = values[index];
		yield { key: index, pointer: db.builder.build(value), value };
	}
}

function* iterateObject(object) {
	for (const key of Object.keys(object || {})) {
		yield { key, pointer: null, value: object[key] };
	}
}

function isPlainObject(value) {
	return Boolean(value)
		&& typeof value === 'object'
		&& !Buffer.isBuffer(value)
		&& !Number.isSafeInteger(value.offset);
}

module.exports = createSourceIterator;
