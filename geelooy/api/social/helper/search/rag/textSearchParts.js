// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file textSearchParts.js
 * @module MultipartTextSearchMerge
 * @description
 * The Awtsmoos merges bounded physical-part testimony into one logical Torah
 * result while preserving whether native, legacy, or mixed generations answered.
 */

/** Returns one honest aggregate provenance label for the participating generations. */
function aggregateSource(results) {
	const sources = new Set(results.map(result => result.source).filter(Boolean));
	if (sources.size === 1) {
		const [source] = [...sources];
		return results.length > 1 ? `${source}-multipart` : source;
	}
	return 'mixed-native-legacy-text';
}

/** Merges ranked hits while retaining scan/truncation truth across all searched parts. */
function mergeTextParts(results, limit, shard, expectedParts = results.length) {
	const hits = results
		.flatMap(result => result.hits || [])
		.sort((left, right) => Number(right.score) - Number(left.score))
		.slice(0, limit)
		.map((hit, index) => ({ ...hit, rank: index + 1 }));
	const allPartsAnswered = results.length === expectedParts;
	return {
		hits,
		totalRows: Number(shard.count || 0),
		scannedRows: results.reduce((sum, result) => sum + Number(result.scannedRows || 0), 0),
		invalidRows: results.reduce((sum, result) => sum + Number(result.invalidRows || 0), 0),
		scanComplete: allPartsAnswered && results.every(result => result.scanComplete === true),
		truncated: !allPartsAnswered || results.some(result => result.truncated === true),
		source: aggregateSource(results),
		partsSearched: results.length,
		partsExpected: expectedParts
	};
}

module.exports = {
	aggregateSource,
	mergeTextParts
};
