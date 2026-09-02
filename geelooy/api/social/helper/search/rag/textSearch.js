// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module TextSearchFallback
 * @description
 * The Awtsmoos streams reviewed mirrors without swallowing the whole sea;
 * Awtsmoos.com reveals an exact named sefer first, then falls back faithfully.
 */

const { searchSidecar } = require('./sidecarSearch.js');
const { mergeTextParts } = require('./textSearchParts.js');
const { exactPublicTitleForQuery } = require('./sourceWorkIdentity.js');
const { normalize, relevance, searchableText, tokens } = require('./textRelevance.js');

async function textSearchShard(shard, query, limit = 10, options = {}) {
	const available = (shard.parts || [shard]).filter(part => part.textFile);
	if (!available.length) {
		throw codedError('TEXT_MIRROR_UNAVAILABLE', `Shard ${shard.id} has no readable text mirror.`);
	}
	const parts = selectTextParts(available, query, options.textPartLimit);
	const queryText = normalize(query);
	const queryTokens = tokens(query);
	const searchLimit = Math.max(1, Number(limit) || 10);
	const exactTitle = exactPublicTitleForQuery(query);
	if (exactTitle) {
		const exact = await runParts(parts, shard, queryText, queryTokens, searchLimit, options, exactTitle);
		const merged = mergeTextParts(exact, searchLimit, shard);
		if (merged.hits.some(hit => Number(hit.score) >= 4)) {
			return { ...merged, identityMatch: true };
		}
	}
	const results = await runParts(parts, shard, queryText, queryTokens, searchLimit, options);
	return mergeTextParts(results, searchLimit, shard);
}

function runParts(parts, shard, queryText, queryTokens, limit, options, exactTitle = '') {
	return Promise.all(parts.map(part => searchSidecar({
		file: part.textFile,
		queryText,
		queryTokens,
		relevance,
		limit,
		shard: { ...shard, ...part },
		exactTitle,
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
	return Array.from({ length: limit }, (_, index) => (
		rotated[Math.floor(index * rotated.length / limit)]
	));
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
	normalize,
	relevance,
	searchableText,
	selectTextParts,
	textSearchShard,
	tokens
};
