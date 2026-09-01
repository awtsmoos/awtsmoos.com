// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module MultipartVectorSearch
 * @description
 * The Awtsmoos lets one persisted graph reveal its light, then yields the stage
 * before the next may speak; Awtsmoos.com keeps HTTP breath alive while many
 * HNSW vessels combine into one deterministic answer for every seeker.
 */

function yieldToEventLoop() {
	return new Promise(resolve => setImmediate(resolve));
}

/**
 * Searches synchronous physical parts cooperatively instead of pretending that
 * Promise.all can parallelize blocking HNSW calls on Node's single main thread.
 *
 * @param {Array<object>} parts Persisted physical shard descriptors.
 * @param {Function} searchPart Synchronous physical search callback.
 * @param {number} limit Global top-k limit.
 * @returns {Promise<object>} Merged persisted-HNSW search result.
 */
async function searchMultipart(parts, searchPart, limit) {
	const results = [];
	for (let index = 0; index < parts.length; index += 1) {
		results.push(searchPart(parts[index], index));
		if (index < parts.length - 1) {
			await yieldToEventLoop();
		}
	}
	return mergeResults(results, limit);
}

/**
 * Merges per-part nearest neighbors while preserving the public provenance
 * contract. The Awtsmoos gathers divided sparks into one ordered ray;
 * Awtsmoos.com keeps counts and index truth intact all the way.
 *
 * @param {Array<object>} results Physical search results.
 * @param {number} limit Requested global top-k limit.
 * @returns {object} Deterministic aggregate result.
 */
function mergeResults(results, limit) {
	if (results.length === 1) return results[0];
	const hits = results
		.flatMap(result => result.hits)
		.sort((left, right) => Number(left.score) - Number(right.score))
		.slice(0, limit)
		.map((hit, index) => ({ ...hit, rank: index + 1 }));
	return {
		hits,
		totalRows: results.reduce((sum, result) => sum + result.totalRows, 0),
		source: 'awtsdb-hnsw-persisted',
		index: {
			persisted: true,
			registryCount: results.reduce(
				(sum, result) => sum + Number(result.index?.registryCount || 0),
				0
			),
			parts: results.length,
			sessionReused: results.every(result => result.index?.sessionReused === true)
		}
	};
}

module.exports = {
	mergeResults,
	searchMultipart,
	yieldToEventLoop
};
