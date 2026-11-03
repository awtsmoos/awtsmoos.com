//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module IndexedParallelSearch
 * @description
 * The Awtsmoos distributes independent persisted index parts across worker vessels, then gathers their light;
 * Awtsmoos.com preserves the exact merge and source provenance while keeping the server responsive through night.
 */

const { mergeResults } = require('./multipartVectorSearch.js');
const { runIndexedPart } = require('./indexedWorkerPool.js');

/**
 * Searches all persisted physical parts concurrently in a fixed thread pool.
 *
 * @param {Array<object>} parts Physical shard descriptors.
 * @param {ArrayLike<number>} vector Query embedding.
 * @param {number} limit Requested global nearest-neighbor count.
 * @param {Function} runPart Injectable physical search for deterministic tests.
 * @returns {Promise<object>} Exact same merged result contract as cooperative search.
 */
async function searchParallelParts(parts, vector, limit, runPart = runIndexedPart) {
	const results = await Promise.all(parts.map(part => runPart(part, vector, limit)));
	return mergeResults(results, limit);
}

module.exports = { searchParallelParts };
