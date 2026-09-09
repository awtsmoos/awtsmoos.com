// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file nativeTextSearch.js
 * @module NativeRagTextSearch
 * @description
 * The Awtsmoos asks persisted Unicode token postings for a bounded candidate
 * constellation, then applies the existing Torah relevance law only to those
 * rows. No JSON mirror, corpus scan, or vector payload enters public results.
 */

const corpusReader = require('../../../../../../ayzarim/DosDB/aiSearch/vectorCorpus/reader.js');
const {
	runBoundedIndexed
} = require('../../../../../../ayzarim/DosDB/awtsmoosBinary/awtsmoosDB/api/search/boundedQuery.js');
const { publicHit } = require('./resultShape.js');
const { openShardSession } = require('./shardStore.js');
const { relevance } = require('./textRelevance.js');

const UNAVAILABLE_CODES = new Set([
	'AWTSMOOS_DB_SEARCH_INDEX_INVALID',
	'RAG_LIST_NAME_REQUIRED',
	'RAG_LIST_UNAVAILABLE',
	'INDEXED_VECTOR_SEARCH_UNAVAILABLE'
]);

/** Returns true only for an absent native search surface, never arbitrary I/O failure. */
function nativeUnavailable(error) {
	return Boolean(error && UNAVAILABLE_CODES.has(error.code));
}

/** Keeps only the strongest bounded rows without exposing native vector fields. */
function rankedHits(session, rows, state) {
	const ranked = [];
	for (const encoded of rows) {
		const row = corpusReader.decode(session.database, encoded);
		const score = relevance(row, state.queryText, state.queryTokens);
		if (score <= 0) continue;
		ranked.push({ score, row });
	}
	return ranked
		.sort((left, right) => right.score - left.score)
		.slice(0, state.limit)
		.map((item, index) => publicHit({
			rank: index + 1,
			score: item.score,
			percent: Math.min(100, item.score * 100),
			row: item.row
		}, index));
}

/**
 * Searches one immutable physical shard through persisted native postings.
 * @returns {object|null} Null only when this generation has no native text index yet.
 */
function searchNativeTextPart(part, state) {
	let session;
	try {
		session = openShardSession(part);
		const result = runBoundedIndexed(
			session.database.search,
			session.list,
			state.queryText,
			{
				match: 'any',
				maxCandidates: state.candidateBudget,
				resultLimit: state.candidateBudget
			}
		);
		return {
			hits: rankedHits(session, result.rows, state),
			totalRows: Number(part.count || session.list.length || 0),
			scannedRows: Number(result.candidateCount || 0),
			invalidRows: 0,
			scanComplete: result.truncated !== true,
			truncated: result.truncated === true,
			source: 'awtsmoos-db-text-index',
			seedPostingCount: Number(result.seedPostingCount || 0)
		};
	} catch (error) {
		if (nativeUnavailable(error)) return null;
		throw error;
	}
}

module.exports = {
	nativeUnavailable,
	rankedHits,
	searchNativeTextPart
};
