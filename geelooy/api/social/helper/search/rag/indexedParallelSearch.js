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
 * @param {number} deadlineAt Optional epoch-ms cutoff: with one set, the lane
 * answers with every part that completed in time (annotated partial) instead
 * of losing the whole lane to its slowest part.
 * @returns {Promise<object>} Exact same merged result contract as cooperative search.
 */
async function searchParallelParts(parts, vector, limit, runPart = runIndexedPart, deadlineAt = 0) {
	if (!deadlineAt) {
		const results = await Promise.all(parts.map(part => runPart(part, vector, limit)));
		return mergeResults(results, limit);
	}
	const completed = [];
	let settled = 0;
	const allSettled = new Promise(resolve => {
		for (const part of parts) {
			Promise.resolve()
				.then(() => runPart(part, vector, limit))
				.then(result => { completed.push(result); })
				.catch(() => {})
				.finally(() => {
					settled += 1;
					if (settled === parts.length) resolve();
				});
		}
	});
	let timer = null;
	const deadlineHit = new Promise(resolve => {
		timer = setTimeout(resolve, Math.max(0, Math.floor(deadlineAt) - Date.now()));
	});
	await Promise.race([allSettled, deadlineHit]);
	if (timer) clearTimeout(timer);
	if (!completed.length) {
		throw Object.assign(
			new Error('No persisted index part answered before the lane deadline.'),
			{ code: 'INDEX_PARTS_DEADLINE' }
		);
	}
	const merged = mergeResults(completed, limit);
	if (completed.length < parts.length) {
		merged.index = {
			...merged.index,
			partial: true,
			partsCompleted: completed.length,
			partsTotal: parts.length
		};
	}
	return merged;
}

module.exports = { searchParallelParts };
