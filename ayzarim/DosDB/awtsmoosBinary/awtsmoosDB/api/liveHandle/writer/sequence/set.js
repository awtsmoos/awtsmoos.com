// B"H

/**
 * @file api/liveHandle/writer/sequence/set.js
 * @chapter Source, Search, Vector, And Free Space Cross One Boundary
 * @description Replaces one sequence value and updates all derived indexes in one database batch.
 */

const constants = require('../../../../constants.js');
const snapshotSearchValue = require('./searchSnapshot.js');

function setSequenceValue(writer, key, value, options = {}) {
	return writer.db.batch(() => performSet(writer, key, value, options));
}

function performSet(writer, key, value, options) {
	const sequence = writer.common.getEngine(
		writer.common.resolveStructPtr(),
		constants.VAL_TYPE.SEQUENCE
	);
	const index = Number.parseInt(key, 10);
	if (Number.isNaN(index)) throw new Error(`Invalid index '${String(key)}'`);
	if (!writer.builder) throw new Error('B"H Fatal: Sequence Builder is missing.');
	const pointerInput = options === true || Boolean(options?.isPtr);
	const skipFree = Boolean(options && typeof options === 'object' && options.skipFree);
	const skipIndexes = Boolean(options && typeof options === 'object' && options.skipIndexes);
	const pointer = pointerInput ? value : writer.builder.build(value);
	const path = writer.handle.getPath();
	const searchIndexed = !skipIndexes && writer.common.getSearchIndex(path);
	const vectorIndexed = !skipIndexes && writer.common.getVectorIndex(path);
	const length = sequence.length();
	const old = captureOldValue(writer, sequence, index, length, searchIndexed || vectorIndexed);

	if (samePointerAtIndex(sequence, index, length, pointerInput, pointer)) {
		writer.common.checkAutoCompact(sequence, constants.VAL_TYPE.SEQUENCE);
		return value;
	}

	writeValue(writer, sequence, index, length, pointer, skipFree);
	writer.common.checkAutoCompact(sequence, constants.VAL_TYPE.SEQUENCE);
	updateSearch(writer, path, pointer, old, value, searchIndexed);
	updateVector(writer, path, index, pointer, old, value, vectorIndexed);
	return value;
}

function updateSearch(writer, path, pointer, old, value, indexed) {
	if (!indexed) return;
	writer.db.search.updateIndex(path, pointer, old.pointer, old.value, value);
	writer.db.search.flush();
}

function updateVector(writer, path, index, pointer, old, value, indexed) {
	if (!indexed) return;
	const vector = writer.common.extractVector(value);
	if (old.pointer && vector) {
		writer.db.vector.replace(path, index, vector, pointer);
		return;
	}
	if (old.pointer) writer.db.vector.delete(path, index);
	if (vector) writer.db.vector.insert(path, index, vector, pointer);
}

function writeValue(writer, sequence, index, length, pointer, skipFree) {
	if (index === length) sequence.push(pointer);
	else if (index < length) sequence.set(index, pointer, { skipFree });
	else if (writer.db.sparseArrays) writer.db.sparseArrays.setPtr(writer.handle, index, pointer);
	else throw new Error(`Index ${index} out of bounds`);
}

function samePointerAtIndex(sequence, index, length, pointerInput, pointer) {
	if (!pointerInput || index >= length) return false;
	const current = sequence.getPtr(index);
	return Boolean(current && Buffer.compare(current, pointer) === 0);
}

function captureOldValue(writer, sequence, index, length, required) {
	if (!required || index >= length) return { pointer: null, value: null };
	try {
		const pointer = sequence.getPtr(index);
		const value = pointer && writer.handle.reader
			? snapshotSearchValue(writer.handle.reader.slice(index, index + 1)[0])
			: null;
		return { pointer, value };
	} catch (_error) {
		return { pointer: null, value: null };
	}
}

module.exports = setSequenceValue;
