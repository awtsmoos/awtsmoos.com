// B"H

/**
 * @file api/search/reindex/sourcePointers.js
 * @chapter Every Indexed Vessel Yields Its Present Physical Records
 * @description Collects source pointers from supported collection structures.
 */

const constants = require('../../../constants.js');
const SmartPointer = require('../../../utils/smartPointer.js');
const Sequence = require('../../../structure/sequence/index.js');
const MapEngine = require('../../../structure/map/index.js');
const Dictionary = require('../../../structure/dictionary/index.js');
const PackedArray = require('../../packed/liveArray.js');

function collectSourcePointers(manager, path) {
	const handle = resolvePath(manager.db.root, path);
	if (!handle) return [];
	const soul = handle[constants.SYMBOLS.INTERNALS] || handle;
	soul.ensureResolved();
	if (!soul.ptr) return [];
	const structPointer = soul.nav.resolveStructPtr();
	const type = effectiveType(soul);
	if (isSequence(type)) return sequencePointers(manager.db, structPointer);
	if (type === constants.VAL_TYPE.PACKED_ARRAY) return packedPointers(manager.db, structPointer);
	if (type === constants.VAL_TYPE.MAP || type === constants.VAL_TYPE.JS_MAP) {
		return mapPointers(manager.db, structPointer);
	}
	if (type === constants.VAL_TYPE.DICTIONARY || type === constants.VAL_TYPE.OBJECT) {
		return dictionaryPointers(manager.db, structPointer);
	}
	return [];
}

function resolvePath(root, path) {
	let current = root;
	for (const part of String(path).split('.').filter(part => part && part !== 'root')) {
		current = current?.[part];
		if (!current) return null;
	}
	return current;
}

function effectiveType(soul) {
	return soul.type === constants.VAL_TYPE.ANCHOR
		? soul.nav.resolveAnchorInnerType() || soul.type
		: soul.type;
}

function isSequence(type) {
	return [
		constants.VAL_TYPE.SEQUENCE,
		constants.VAL_TYPE.ARRAY,
		constants.VAL_TYPE.SET,
		constants.VAL_TYPE.JS_SET
	].includes(type);
}

function sequencePointers(db, pointer) {
	const sequence = new Sequence(db.allocator, pointer);
	const output = [];
	for (let index = 0; index < sequence.length(); index++) {
		const itemPointer = sequence.getPtr(index);
		if (itemPointer) output.push(itemPointer);
	}
	return output;
}

function packedPointers(db, pointer) {
	return (PackedArray.readArray(db, SmartPointer.toBuffer(pointer)) || [])
		.map(value => db.builder.build(value));
}

function mapPointers(db, pointer) {
	return Array.from(new MapEngine(db.allocator, pointer).range())
		.map(item => item?.ptr)
		.filter(Boolean);
}

function dictionaryPointers(db, pointer) {
	const dictionary = new Dictionary(db.allocator, pointer);
	dictionary._init();
	return dictionary.map ? mapPointers(db, dictionary.map.ptr) : [];
}

module.exports = collectSourcePointers;
