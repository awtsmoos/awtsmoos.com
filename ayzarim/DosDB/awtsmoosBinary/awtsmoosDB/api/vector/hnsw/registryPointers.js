// B"H

/**
 * @file api/vector/hnsw/registryPointers.js
 * @chapter The Registry Reads Seals Before Resolving The Worlds They Address
 * @description
 * Reads raw sequence item pointers. Direct custom-node seals remain untouched,
 * while legacy Buffer-wrapped seals are resolved once for backward compatibility.
 */

const constants = require('../../../constants.js');
const SmartPointer = require('../../../utils/smartPointer.js');
const Sequence = require('../../../structure/sequence/index.js');

function read(hnsw, handle) {
	const soul = writableSoul(handle);
	const sequence = new Sequence(hnsw.db.allocator, soul.writer.common.resolveStructPtr());
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
	const soul = writableSoul(handle);
	const common = soul.writer.common;
	const sequence = new Sequence(hnsw.db.allocator, common.resolveStructPtr());
	sequence.bulkLoadPointers(pointers);
	common.checkAutoCompact(sequence, constants.VAL_TYPE.SEQUENCE);
}

function persist(handle, id, pointer) {
	if (id >= handle.length) handle.push(pointer);
	else handle[id] = pointer;
}

function release(hnsw, previous, current) {
	if (!Buffer.isBuffer(previous)) return;
	const oldLocation = SmartPointer.decode(previous);
	const newLocation = SmartPointer.decode(current);
	if (!oldLocation || !Number.isSafeInteger(oldLocation.offset) || oldLocation.length <= 0) return;
	if (newLocation && oldLocation.offset === newLocation.offset && oldLocation.length === newLocation.length) return;
	hnsw.db.allocator.free(oldLocation.offset, oldLocation.length);
}

function writableSoul(handle) {
	const soul = handle?.[constants.SYMBOLS.INTERNALS];
	if (!soul?.writer?.common) throw new Error('B"H HNSW registry handle has no writable soul');
	soul.ensureResolved(true);
	return soul;
}

function normalize(value) {
	if (Buffer.isBuffer(value)) return Buffer.from(value);
	if (Array.isArray(value) && Buffer.isBuffer(value[1])) return Buffer.from(value[1]);
	if (ArrayBuffer.isView(value)) return Buffer.from(value.buffer, value.byteOffset, value.byteLength);
	return null;
}

module.exports = {
	persist,
	read,
	release,
	replace
};
