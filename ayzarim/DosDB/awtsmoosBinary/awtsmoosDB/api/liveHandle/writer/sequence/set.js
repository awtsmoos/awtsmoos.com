// B"H

/**
 * @file api/liveHandle/writer/sequence/set.js
 * @chapter The Former Posting Is Severed Before Its Body Can Be Reused
 * @description Replaces one sequence value with ordered search and vector maintenance.
 */

const constants = require('../../../../constants.js');
const snapshotSearchValue = require('./searchSnapshot.js');

function setSequenceValue(writer, key, value, options) {
	const sequence = writer.common.getEngine(writer.common.resolveStructPtr(), constants.VAL_TYPE.SEQUENCE);
	const index = Number.parseInt(key, 10);
	if (Number.isNaN(index)) throw new Error(`Invalid index '${String(key)}'`);
	if (!writer.builder) throw new Error('B"H Fatal: Sequence Builder is missing.');
	const pointerInput = options === true || Boolean(options?.isPtr);
	const skipFree = Boolean(options && typeof options === 'object' && options.skipFree);
	const pointer = pointerInput ? value : writer.builder.build(value);
	const path = writer.handle.getPath();
	const searchIndexed = writer.common.getSearchIndex(path);
	const vectorIndexed = writer.common.getVectorIndex(path);
	const length = sequence.length();
	const old = captureOldValue(writer, sequence, index, length, searchIndexed || vectorIndexed);

	if (samePointerAtIndex(sequence, index, length, pointerInput, pointer)) {
		writer.common.checkAutoCompact(sequence, constants.VAL_TYPE.SEQUENCE);
		return;
	}
	removeOldIndexes(writer, path, index, old, searchIndexed, vectorIndexed);
	writeValue(writer, sequence, index, length, pointer, skipFree);
	writer.common.checkAutoCompact(sequence, constants.VAL_TYPE.SEQUENCE);
	addNewIndexes(writer, path, index, pointer, value, searchIndexed, vectorIndexed);
}

function removeOldIndexes(writer, path, index, old, searchIndexed, vectorIndexed) {
	if (searchIndexed && old.pointer) {
		writer.db.search.updateIndex(path, null, old.pointer, old.value, null);
		writer.db.search.flush();
	}
	if (vectorIndexed && old.pointer) writer.db.vector.delete(path, index);
}

function addNewIndexes(writer, path, index, pointer, value, searchIndexed, vectorIndexed) {
	if (searchIndexed) writer.db.search.updateIndex(path, pointer, null, null, value);
	if (!vectorIndexed) return;
	const vector = writer.common.extractVector(value);
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
