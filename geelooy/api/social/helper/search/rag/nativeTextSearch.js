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
 * Candidate generation unions only content-token postings: English function
 * words ("the", "of", ...) have enormous posting lists and carry no topical
 * evidence, so letting them seed the bounded `match: 'any'` union once let a
 * lone stopword match crowd out real candidates and surface as junk.
 */

const corpusReader = require('../../../../../../ayzarim/DosDB/aiSearch/vectorCorpus/reader.js');
const {
	runBoundedIndexed
} = require('../../../../../../ayzarim/DosDB/awtsmoosBinary/awtsmoosDB/api/search/boundedQuery.js');
const { publicHit } = require('./resultShape.js');
const { openShardSession } = require('./shardStore.js');
const { contentTokens, relevance } = require('./textRelevance.js');

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
 * Builds the candidate-generation query from content tokens only. The full
 * original query text is still used for relevance/phrase scoring; this string
 * only decides which postings seed the bounded candidate union. Returns null
 * when the query has tokens but none of them carry evidence (a function-word
 * only query), meaning no posting should be opened at all.
 */
function candidateQueryText(state) {
	const queryTokens = Array.isArray(state.queryTokens) ? state.queryTokens : [];
	if (!queryTokens.length) return state.queryText;
	const content = contentTokens(queryTokens);
	if (!content.length) return null;
	return content.join(' ');
}

/**
 * Searches one immutable physical shard through persisted native postings.
 * @returns {object|null} Null only when this generation has no native text index yet.
 */
function searchNativeTextPart(part, state) {
	let session;
	try {
		session = openShardSession(part);
		const candidateQuery = candidateQueryText(state);
		if (candidateQuery === null) {
			return {
				hits: [],
				totalRows: Number(part.count || session.list.length || 0),
				scannedRows: 0,
				invalidRows: 0,
				scanComplete: true,
				truncated: false,
				source: 'awtsmoos-db-text-index',
				seedPostingCount: 0
			};
		}
		const result = runBoundedIndexed(
			session.database.search,
			session.list,
			candidateQuery,
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
	candidateQueryText,
	nativeUnavailable,
	rankedHits,
	searchNativeTextPart
};
