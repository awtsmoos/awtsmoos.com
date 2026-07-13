// B"H

/**
 * @file api/vector/hnsw/registryPointers.js
 * @chapter Superseded Bodies Return Through The Strict Ownership Gate
 * @description Reads direct node seals, persists replacements, and strictly frees former bodies after linkage.
 */

const constants = require('../../../constants.js');
const SmartPointer = require('../../../utils/smartPointer.js');
const Sequence = require('../../../structure/sequence/index.js');

function read(hnsw, handle) {
	const common = writerCommon(handle);
	const sequence = new Sequence(hnsw.db.allocator, common.resolveStructPtr());
	const output = [];
	for (let index = 0; index < sequence.length(); index++) {
		output.push(readItemPointer(hnsw, sequence.getPtr(index)));
	}
	return output;
}

function readItemPointer(hnsw, rawPointer) {
	if (!Buffer.isBuffer(rawPointer)) return null;
	const decoded = SmartPointer.decode(rawPointer);
	if (decoded?.type === constants.TYPE_CUSTOM_INSTANCE) return Buffer.from(rawPointer);
	let value;
	try { value = SmartPointer.resolve(rawPointer, hnsw.db.allocator); }
	catch (_error) { return null; }
	return normalize(value);
}

function replace(hnsw, handle, pointers) {
	const common = writerCommon(handle);
	const sequence = new Sequence(hnsw.db.allocator, common.resolveStructPtr());
	sequence.bulkLoadPointers(pointers);
	common.checkAutoCompact(sequence, constants.VAL_TYPE.SEQUENCE);
}

function persist(hnsw, handle, id, pointer) {
	const common = writerCommon(handle);
	const sequence = new Sequence(hnsw.db.allocator, common.resolveStructPtr());
	if (id >= sequence.length()) sequence.push(pointer);
	else sequence.set(id, pointer, { skipFree: true });
	common.checkAutoCompact(sequence, constants.VAL_TYPE.SEQUENCE);
}

function release(hnsw, previous, current) {
	if (!Buffer.isBuffer(previous)) return;
	const oldLocation = SmartPointer.decode(previous);
	const newLocation = SmartPointer.decode(current);
	if (!oldLocation || !Number.isSafeInteger(oldLocation.offset) || oldLocation.length <= 0) return;
	if (newLocation && oldLocation.offset === newLocation.offset && oldLocation.length === newLocation.length) return;
	hnsw.db.allocator.free(oldLocation.offset, oldLocation.length);
}

function writerCommon(handle) {
	const soul = handle?.[constants.SYMBOLS.INTERNALS];
	if (!soul?.writer?.common) throw new Error('B"H HNSW registry handle has no writable soul');
	soul.ensureResolved(true);
	return soul.writer.common;
}

function normalize(value) {
	if (Buffer.isBuffer(value)) return Buffer.from(value);
	if (Array.isArray(value) && Buffer.isBuffer(value[1])) return Buffer.from(value[1]);
	if (ArrayBuffer.isView(value)) return Buffer.from(value.buffer, value.byteOffset, value.byteLength);
	return null;
}

module.exports = { persist, read, release, replace };
