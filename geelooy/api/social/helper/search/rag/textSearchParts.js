// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module MultipartTextSearch
 * @description
 * Searches every reviewed JSONL part concurrently, merges ranked hits, and reports
 * aggregate scan provenance. No vector database is opened by this operation.
 */

function mergeTextParts(results, limit, shard) {
	const hits = results
		.flatMap(result => result.hits || [])
		.sort((left, right) => Number(right.score) - Number(left.score))
		.slice(0, limit)
		.map((hit, index) => ({ ...hit, rank: index + 1 }));
	return {
		hits,
		totalRows: Number(shard.count || 0),
		scannedRows: results.reduce((sum, result) => sum + Number(result.scannedRows || 0), 0),
		invalidRows: results.reduce((sum, result) => sum + Number(result.invalidRows || 0), 0),
		scanComplete: results.every(result => result.scanComplete === true),
		truncated: results.some(result => result.truncated === true),
		source: results.length > 1
			? 'jsonl-text-mirror-multipart'
			: 'jsonl-text-mirror',
		partsSearched: results.length
	};
}

module.exports = {
	mergeTextParts
};
