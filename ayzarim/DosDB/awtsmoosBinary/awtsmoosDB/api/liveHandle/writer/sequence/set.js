// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file api/liveHandle/writer/sequence/set.js
 * @chapter The Ordered River And Its Named Garments Share One Boundary
 * @description
 * Replaces numeric sequence values through the indexed mutation path and stores
 * named properties in the stable anchor metadata dictionary. Both paths remain
 * inside one database batch, where the Awtsmoos links the new vessel before any
 * former chamber may return to reusable space.
 */

const constants = require('../../../../constants.js');
const AnchorMetadata = require('../../../../structure/anchor/metadata.js');
const parseSequenceIndex = require('../../sequenceKey.js');
const snapshotSearchValue = require('./searchSnapshot.js');

function setSequenceValue(writer, key, value, options = {}) {
	return writer.db.batch(() => performSet(writer, key, value, options));
}

function performSet(writer, key, value, options) {
	const index = parseSequenceIndex(key);
	if (index === null) return setNamedProperty(writer, key, value, options);

	const sequence = writer.common.getEngine(
		writer.common.resolveStructPtr(),
		constants.VAL_TYPE.SEQUENCE
	);
	if (!writer.builder) throw new Error('B"H Fatal: Sequence Builder is missing.');
	const flags = parseOptions(options);
	const pointer = flags.isPointer ? value : writer.builder.build(value);
	const path = writer.handle.getPath();
	const searchIndexed = !flags.skipIndexes && writer.common.getSearchIndex(path);
	const vectorIndexed = !flags.skipIndexes && writer.common.getVectorIndex(path);
	const length = sequence.length();
	const old = captureOldValue(writer, sequence, index, length, searchIndexed || vectorIndexed);

	if (samePointerAtIndex(sequence, index, length, flags.isPointer, pointer)) {
		writer.common.checkAutoCompact(sequence, constants.VAL_TYPE.SEQUENCE);
		return value;
	}

	writeValue(writer, sequence, index, length, pointer, flags.skipFree);
	writer.common.checkAutoCompact(sequence, constants.VAL_TYPE.SEQUENCE);
	updateSearch(writer, path, pointer, old, value, searchIndexed);
	updateVector(writer, path, index, pointer, old, value, vectorIndexed);
	return value;
}

function setNamedProperty(writer, key, value, options) {
	if (writer.handle.type !== constants.VAL_TYPE.ANCHOR) {
		throw new Error(`Invalid sequence property '${String(key)}' without a stable anchor`);
	}
	if (!writer.builder) throw new Error('B"H Fatal: Sequence Builder is missing.');
	const flags = parseOptions(options);
	const pointer = flags.isPointer ? value : writer.builder.build(value);
	const metadata = new AnchorMetadata(writer.db, writer.handle.ptr);
	metadata.set(String(key), pointer, { skipFree: flags.skipFree });
	return value;
}

function parseOptions(options) {
	return {
		isPointer: options === true || Boolean(options && options.isPtr),
		skipFree: Boolean(options && typeof options === 'object' && options.skipFree),
		skipIndexes: Boolean(options && typeof options === 'object' && options.skipIndexes)
	};
}

function updateSearch(writer, path, pointer, old, value, indexed) {
	if (!indexed) return;
	writer.db.search.updateIndex(path, pointer, old.pointer, old.value, value);
	writer.db.search.flush();
}

function updateVector(writer, path, index, pointer, old, value, indexed) {
	if (!indexed) return;
	const vector = writer.common.extractVector(value);
	if (old.pointer && vector) return writer.db.vector.replace(path, index, vector, pointer);
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
