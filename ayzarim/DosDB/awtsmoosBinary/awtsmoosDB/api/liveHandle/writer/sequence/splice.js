// B"H

/**
 * @file api/liveHandle/writer/sequence/splice.js
 * @chapter Removed Postings Are Severed Before Sequence Space Is Reused
 * @description Splices a sequence while preserving exact search and vector index truth.
 */

const constants = require('../../../../constants.js');
const snapshotSearchValue = require('./searchSnapshot.js');

function spliceSequence(writer, start, deleteCount, ...argumentsList) {
	writer.common.invalidateEngine();
	const { options, items } = parseArguments(argumentsList);
	const path = writer.handle.getPath();
	const sequence = writer.common.getEngine(writer.common.resolveStructPtr(), constants.VAL_TYPE.SEQUENCE);
	const searchIndexed = writer.common.getSearchIndex(path);
	const vectorIndexed = writer.common.getVectorIndex(path);
	const prepared = items.map(item => options.isPtr ? item : writer.builder.build(item));
	const removed = captureRemoved(writer, sequence, start, deleteCount, searchIndexed || vectorIndexed);

	removeSearchPostings(writer, path, removed, searchIndexed);
	for (const row of removed) {
		if (!options.skipFree) writer.common.checkGraphCleanup(row.pointer);
	}
	sequence.splice(start, deleteCount, ...prepared);
	writer.common.checkAutoCompact(sequence, constants.VAL_TYPE.SEQUENCE);
	addSearchPostings(writer, path, prepared, items, options, searchIndexed);
	if (vectorIndexed) writer.db.vector.reconcile(path);
	return removed.map(row => row.value);
}

function removeSearchPostings(writer, path, removed, indexed) {
	if (!indexed) return;
	for (const row of [...removed].reverse()) {
		writer.db.search.updateIndex(path, null, row.pointer, row.value, null);
	}
	writer.db.search.flush();
}

function addSearchPostings(writer, path, prepared, items, options, indexed) {
	if (!indexed || options.isPtr) return;
	for (let index = 0; index < items.length; index++) {
		writer.db.search.updateIndex(path, prepared[index], null, null, items[index]);
	}
}

function captureRemoved(writer, sequence, start, deleteCount, required) {
	const removed = [];
	for (let offset = 0; offset < deleteCount; offset++) {
		const index = start + offset;
		if (index >= sequence.length()) break;
		const pointer = sequence.getPtr(index);
		if (!pointer) continue;
		let value = null;
		if (required && writer.handle.reader) {
			try { value = snapshotSearchValue(writer.handle.reader.slice(index, index + 1)[0]); }
			catch (_error) {}
		}
		removed.push({ index, pointer, value });
	}
	return removed;
}

function parseArguments(argumentsList) {
	const last = argumentsList[argumentsList.length - 1];
	if (last && typeof last === 'object' && last._isAwtsmoosOptions) {
		return { options: last, items: argumentsList.slice(0, -1) };
	}
	return { options: {}, items: argumentsList };
}

module.exports = spliceSequence;
