// B"H

/**
 * @file api/liveHandle/writer/sequence/push.js
 * @chapter A New Sequence Element Enters Every Configured Index
 * @description Appends one value and synchronizes search and vector indexes.
 */

const constants = require('../../../../constants.js');

function pushSequenceValue(writer, value, options = {}) {
	const sequence = writer.common.getEngine(
		writer.common.resolveStructPtr(),
		constants.VAL_TYPE.SEQUENCE
	);
	const pointerInput = options === true || Boolean(options?.isPtr);
	const pointer = pointerInput ? value : writer.builder.build(value);
	const index = sequence.length();
	const path = writer.handle.getPath();
	const searchIndexed = writer.common.getSearchIndex(path);
	const vectorIndexed = writer.common.getVectorIndex(path);

	sequence.push(pointer);
	writer.common.checkAutoCompact(sequence, constants.VAL_TYPE.SEQUENCE);
	if (searchIndexed) writer.db.search.updateIndex(path, pointer, null, null, value);
	if (vectorIndexed) {
		const vector = writer.common.extractVector(value);
		if (vector) writer.db.vector.insert(path, index, vector, pointer);
	}
	return index + 1;
}

module.exports = pushSequenceValue;
