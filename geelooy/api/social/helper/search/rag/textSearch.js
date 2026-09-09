// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file textSearch.js
 * @module BoundedRagTextSearch
 * @description
 * One logical Torah search receives one finite candidate, row, part, and time
 * budget. Native AwtsmoosDB postings answer first; legacy mirrors exist only as
 * migration fallback until each immutable corpus generation is republished.
 */

const { publicHit } = require('./resultShape.js');
const { mergeTextParts } = require('./textSearchParts.js');
const { runTextParts } = require('./textSearchRunner.js');
const { exactWorkIdentityForQuery } = require('./sourceWorkIdentity.js');
const { normalize, relevance, searchableText, tokens } = require('./textRelevance.js');
const { selectTextParts, textSearchBudgets } = require('./textSearchBudget.js');

/** Preserves canonical work identity as the cheapest and strongest exact result. */
function exactIdentityResult(shard, identity) {
	const hit = publicHit({
		rank: 1,
		score: 4,
		percent: 100,
		row: {
			pageId: identity.pageId,
			title: identity.title,
			seeds: [identity.work],
			sourceLabel: shard.title,
			corpus: shard.id
		}
	});
	return {
		hits: [hit],
		totalRows: Number(shard.count || 0),
		scannedRows: 0,
		invalidRows: 0,
		scanComplete: true,
		truncated: false,
		source: 'canonical-work-identity',
		partsSearched: 0,
		partsExpected: 0,
		identityMatch: true
	};
}

/**
 * Searches one logical RAG shard through native indexed retrieval with bounded fallback.
 * @param {object} shard Logical corpus description.
 * @param {string} query User query.
 * @param {number} limit Maximum public hits.
 * @param {object} options Shared request-budget policy.
 */
async function textSearchShard(shard, query, limit = 10, options = {}) {
	const available = (shard.parts || [shard])
		.filter(part => part.file || part.textFile);
	if (!available.length) {
		throw codedError('TEXT_SEARCH_UNAVAILABLE', `Shard ${shard.id} has no searchable publication.`);
	}
	const identity = exactWorkIdentityForQuery(query);
	if (identity) return exactIdentityResult(shard, identity);
	const selected = selectTextParts(available, query, options.textPartLimit);
	const budgets = textSearchBudgets(selected, options);
	const queryText = normalize(query);
	const queryTokens = tokens(query);
	const searchLimit = Math.max(1, Number(limit) || 10);
	const results = await runTextParts(selected, shard, {
		queryText,
		queryTokens,
		limit: searchLimit
	}, budgets, options);
	if (!results.length) {
		throw codedError('TEXT_SEARCH_UNAVAILABLE', `Shard ${shard.id} has no usable text index or migration mirror.`);
	}
	return mergeTextParts(results, searchLimit, shard, selected.length);
}

function codedError(code, message) {
	return Object.assign(new Error(message), { code });
}

module.exports = {
	exactIdentityResult,
	normalize,
	relevance,
	searchableText,
	selectTextParts,
	textSearchShard,
	tokens
};
