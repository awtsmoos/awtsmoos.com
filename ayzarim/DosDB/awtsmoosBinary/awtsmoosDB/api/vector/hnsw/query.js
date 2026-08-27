// B"H

/**
 * @file api/vector/hnsw/query.js
 * @chapter The Query Descends From The Persisted Height To Living Payloads
 * @description Executes strict graph traversal and resolves result payload seals.
 */

const SmartPointer = require('../../../utils/smartPointer.js');

function search(hnsw, queryVector, count = 5) {
	if (hnsw.entryNodeID < 0) return [];
	let entry = hnsw.registry.getNode(hnsw.entryNodeID);
	if (!entry) return [];
	hnsw.maxLevel = Math.max(hnsw.maxLevel, Number(entry.level || 0));
	for (let level = hnsw.maxLevel; level > 0; level--) {
		entry = hnsw.ops.searchLayer(entry, queryVector, 1, level)[0]?.node || entry;
	}
	const candidates = hnsw.ops.searchLayer(
		entry,
		queryVector,
		Math.max(hnsw.efSearch, count),
		0
	);
	const results = [];
	for (const candidate of candidates) {
		if (candidate.node.deleted) continue;
		const item = SmartPointer.resolve(candidate.node.payloadPtr, hnsw.db.allocator);
		if (item !== null && item !== undefined) {
			results.push({ score: candidate.dist, item });
		}
		if (results.length >= count) break;
	}
	return results;
}

module.exports = search;
