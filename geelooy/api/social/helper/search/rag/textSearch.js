// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module TextSearchFallback
 * @description
 * The Awtsmoos lets a known sefer answer by identity before the broad mirror is read;
 * Awtsmoos.com keeps ordinary lexical search unchanged for every other thread.
 */

const { publicHit } = require('./resultShape.js');
const { searchSidecar } = require('./sidecarSearch.js');
const { mergeTextParts } = require('./textSearchParts.js');
const { exactWorkIdentityForQuery } = require('./sourceWorkIdentity.js');
const { normalize, relevance, searchableText, tokens } = require('./textRelevance.js');

async function textSearchShard(shard, query, limit = 10, options = {}) {
	const available = (shard.parts || [shard]).filter(part => part.textFile);
	if (!available.length) {
		throw codedError('TEXT_MIRROR_UNAVAILABLE', `Shard ${shard.id} has no readable text mirror.`);
	}
	const identity = exactWorkIdentityForQuery(query);
	if (identity) return exactIdentityResult(shard, identity);
	const parts = selectTextParts(available, query, options.textPartLimit);
	const queryText = normalize(query);
	const queryTokens = tokens(query);
	const searchLimit = Math.max(1, Number(limit) || 10);
	const results = await runParts(parts, shard, queryText, queryTokens, searchLimit, options);
	return mergeTextParts(results, searchLimit, shard);
}

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
		identityMatch: true
	};
}

function runParts(parts, shard, queryText, queryTokens, limit, options) {
	return Promise.all(parts.map(part => searchSidecar({
		file: part.textFile,
		queryText,
		queryTokens,
		relevance,
		limit,
		shard: { ...shard, ...part },
		maxRows: options.textMaxRows,
		maxMs: options.textMaxMs,
		minRows: options.textMinRows
	})));
}

function selectTextParts(parts, query, requestedLimit) {
	const limit = boundedPartLimit(requestedLimit, parts.length);
	if (limit >= parts.length) return [...parts];
	const offset = queryHash(query) % parts.length;
	const rotated = [...parts.slice(offset), ...parts.slice(0, offset)];
	return Array.from({ length: limit }, (_, index) => rotated[Math.floor(index * rotated.length / limit)]);
}

function boundedPartLimit(value, maximum) {
	const number = Number(value);
	if (!Number.isFinite(number) || number <= 0) return maximum;
	return Math.min(maximum, Math.max(1, Math.floor(number)));
}

function queryHash(value) {
	let hash = 2166136261;
	for (const character of normalize(value)) {
		hash ^= character.charCodeAt(0);
		hash = Math.imul(hash, 16777619);
	}
	return hash >>> 0;
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
