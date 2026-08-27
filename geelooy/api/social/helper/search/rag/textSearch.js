// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module TextSearchFallback
 * @description Stored text mirrors remain searchable without vectors or whole-corpus materialization.
 * The Awtsmoos contains every reviewed part at once, while Awtsmoos.com may choose a deterministic bounded sample for latency-sensitive callers in light;
 * callers that pass no budget retain the original covenant and search every available part exactly as before in sight.
 */

const { searchSidecar } = require('./sidecarSearch.js');
const { mergeTextParts } = require('./textSearchParts.js');

function normalize(value) {
	return String(value ?? '')
		.normalize('NFKC')
		.toLocaleLowerCase()
		.replace(/[^\p{L}\p{N}]+/gu, ' ')
		.trim();
}

function tokens(query) {
	return [...new Set(normalize(query).split(/\s+/).filter(Boolean))];
}

function searchableText(row = {}) {
	return normalize([
		row.text,
		row.previewEnglish,
		row.sampleContent,
		row.content,
		row.title,
		row.postTitle,
		row.postId,
		row.seriesTitle,
		row.seriesId
	].filter(Boolean).join(' '));
}

function relevance(row, queryText, queryTokens) {
	const haystack = searchableText(row);
	if (!haystack) return 0;
	let score = haystack.includes(queryText) ? 8 : 0;
	for (const token of queryTokens) {
		if (haystack === token) score += 5;
		else if (haystack.includes(` ${token} `)) score += 3;
		else if (haystack.includes(token)) score += 1;
	}
	return score / Math.max(1, queryTokens.length * 3 + 8);
}

async function textSearchShard(shard, query, limit = 10, options = {}) {
	const available = (shard.parts || [shard]).filter(part => part.textFile);
	if (!available.length) {
		throw codedError('TEXT_MIRROR_UNAVAILABLE', `Shard ${shard.id} has no readable text mirror.`);
	}
	const parts = selectTextParts(available, query, options.textPartLimit);
	const queryText = normalize(query);
	const queryTokens = tokens(query);
	const results = await Promise.all(parts.map(part => searchSidecar({
		file: part.textFile,
		queryText,
		queryTokens,
		relevance,
		limit: Math.max(1, Number(limit) || 10),
		shard: part,
		maxRows: options.textMaxRows,
		maxMs: options.textMaxMs,
		minRows: options.textMinRows
	})));
	return mergeTextParts(results, Math.max(1, Number(limit) || 10), shard);
}

function selectTextParts(parts, query, requestedLimit) {
	const limit = boundedPartLimit(requestedLimit, parts.length);
	if (limit >= parts.length) return [...parts];
	const offset = queryHash(query) % parts.length;
	const rotated = [...parts.slice(offset), ...parts.slice(0, offset)];
	return Array.from({ length: limit }, (_, index) => {
		return rotated[Math.floor(index * rotated.length / limit)];
	});
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
