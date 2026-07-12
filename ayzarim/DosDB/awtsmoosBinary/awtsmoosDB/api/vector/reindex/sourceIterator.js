// B"H

/**
 * @file api/vector/reindex/sourceIterator.js
 * @chapter Every Record Is Counted From Its Native Vessel
 * @description
 * Chooses the physical iterator for a vector-enabled LiveHandle while preserving
 * each record's existing payload pointer for destination-owned HNSW nodes.
 */

const constants = require('../../../constants.js');
const SmartPointer = require('../../../utils/smartPointer.js');
const Sequence = require('../../../structure/sequence/index.js');
const MapEngine = require('../../../structure/map/index.js');
const PackedArray = require('../../packed/liveArray.js');

function createSourceIterator(db, soul) {
	const type = resolvedType(soul);
	const pointer = soul.nav.resolveStructPtr();
	const T = constants.VAL_TYPE;

	if ([T.SEQUENCE, T.ARRAY, T.SET].includes(type)) {
		return iterateSequence(new Sequence(db.allocator, pointer));
	}
	if (type === T.PACKED_ARRAY) {
		return iteratePackedArray(db, pointer);
	}
	if ([T.MAP, T.DICTIONARY, T.OBJECT].includes(type)) {
		if (pointer.isStructure) return iterateMap(new MapEngine(db.allocator, pointer));
		return iterateObject(pointer);
	}
	return null;
}

function resolvedType(soul) {
	const T = constants.VAL_TYPE;
	if (soul.type !== T.ANCHOR) return soul.type;
	return soul.nav.resolveAnchorInnerType() || soul.type;
}

function* iterateSequence(engine) {
	const length = engine.length();
	for (let index = 0; index < length; index++) {
		yield { key: index, pointer: engine.getPtr(index), value: undefined };
	}
}

function* iterateMap(engine) {
	for (const row of engine.range()) {
		yield { key: row.key.toString('utf8'), pointer: row.ptr, value: undefined };
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

module.exports = createSourceIterator;
