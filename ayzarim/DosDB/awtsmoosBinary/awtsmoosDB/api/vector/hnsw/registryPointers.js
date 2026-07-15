// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file api/vector/hnsw/registryPointers.js
 * @chapter Persisted Roads Are Read Once And Rewritten Only Through Ownership
 * @description
 * Delegates single-pass registry reading while preserving strict replacement,
 * mutation, and release rules for every persisted HNSW node body.
 */

const constants = require('../../../constants.js');
const SmartPointer = require('../../../utils/smartPointer.js');
const Sequence = require('../../../structure/sequence/index.js');
const { readPointers } = require('./registryTraversal.js');

function read(hnsw, handle) {
	const common = writerCommon(handle);
	return readPointers(
		hnsw,
		common.resolveStructPtr()
	);
}

function replace(hnsw, handle, pointers) {
	const common = writerCommon(handle);
	const sequence = createSequence(
		hnsw,
		common.resolveStructPtr()
	);
	sequence.bulkLoadPointers(pointers);
	common.checkAutoCompact(
		sequence,
		constants.VAL_TYPE.SEQUENCE
	);
}

function persist(hnsw, handle, id, pointer) {
	const common = writerCommon(handle);
	const sequence = createSequence(
		hnsw,
		common.resolveStructPtr()
	);
	if (id >= sequence.length()) {
		sequence.push(pointer);
	} else {
		sequence.set(
			id,
			pointer,
			{ skipFree: true }
		);
	}
	common.checkAutoCompact(
		sequence,
		constants.VAL_TYPE.SEQUENCE
	);
}

function release(hnsw, previous, current) {
	if (!Buffer.isBuffer(previous)) return;
	const oldLocation = SmartPointer.decode(previous);
	const newLocation = SmartPointer.decode(current);
	if (!oldLocation) return;
	if (!Number.isSafeInteger(oldLocation.offset)) return;
	if (oldLocation.length <= 0) return;
	if (sameLocation(oldLocation, newLocation)) return;
	hnsw.db.allocator.free(
		oldLocation.offset,
		oldLocation.length
	);
}

function sameLocation(oldLocation, newLocation) {
	return Boolean(
		newLocation
		&& oldLocation.offset === newLocation.offset
		&& oldLocation.length === newLocation.length
	);
}

function createSequence(hnsw, pointer) {
	return new Sequence(
		hnsw.db.allocator,
		pointer
	);
}

function writerCommon(handle) {
	const soul = handle?.[constants.SYMBOLS.INTERNALS];
	if (!soul?.writer?.common) {
		throw new Error('B"H HNSW registry handle has no writable soul');
	}
	soul.ensureResolved(true);
	return soul.writer.common;
}

module.exports = {
	persist,
	read,
	release,
	replace
};
