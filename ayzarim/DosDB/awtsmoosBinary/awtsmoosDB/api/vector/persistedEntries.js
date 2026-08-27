// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file api/vector/persistedEntries.js
 * @chapter The Graph Becomes The Exact Ledger Without Resolving Every Payload
 * @description Enumerates live persisted Float32 vectors and delays payload
 * resolution until exact scoring has selected only the requested top results.
 */

const SmartPointer = require('../../utils/smartPointer.js');
const { cosine, vectorOf } = require('./query.js');

function entries(manager, handleOrPath, options = {}) {
	const status = manager.indexStatus(handleOrPath);
	if (!status.usable) throw vectorError(status.path);
	const output = [];
	for (const [key, id] of status.index.keys.entries()) {
		const node = status.index.registry.getNode(Number(id));
		if (!node || node.deleted) continue;
		output.push({
			key: String(key),
			id: Number(id),
			vector: new Float32Array(node.vector),
			payloadPtr: node.payloadPtr,
			item: options.resolvePayload === false
				? undefined
				: SmartPointer.resolve(node.payloadPtr, manager.db.allocator)
		});
	}
	return output;
}

function nearestExact(manager, handleOrPath, queryVector, count = 5) {
	const query = vectorOf(queryVector);
	if (!query) throw new Error('B"H exact persisted query is not a finite vector');
	return entries(manager, handleOrPath, { resolvePayload: false })
		.map(entry => ({
			key: entry.key,
			score: cosine(query, entry.vector),
			payloadPtr: entry.payloadPtr
		}))
		.sort((left, right) => right.score - left.score)
		.slice(0, Number(count) || 5)
		.map(result => ({
			key: result.key,
			score: result.score,
			item: SmartPointer.resolve(result.payloadPtr, manager.db.allocator)
		}));
}

function vectorError(path) {
	const error = new Error(`B"H persisted vector graph is not usable: ${path}`);
	error.code = 'AWTSMOOS_DB_VECTOR_INDEX_UNUSABLE';
	return error;
}

module.exports = {
	entries,
	nearestExact
};
