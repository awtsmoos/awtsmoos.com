// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module TextSearchFallback
 * @description
 * Stored text mirrors remain searchable without vectors, installation, database
 * locks, or whole-corpus materialization. Multipart lanes search every reviewed
 * sidecar and merge their best results into one logical corpus response.
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

async function textSearchShard(shard, query, limit = 10) {
	const parts = (shard.parts || [shard]).filter(part => part.textFile);
	if (!parts.length) {
		throw codedError('TEXT_MIRROR_UNAVAILABLE', `Shard ${shard.id} has no readable text mirror.`);
	}
	const queryText = normalize(query);
	const queryTokens = tokens(query);
	const results = await Promise.all(parts.map(part => searchSidecar({
		file: part.textFile,
		queryText,
		queryTokens,
		relevance,
		limit: Math.max(1, Number(limit) || 10),
		shard: part
	})));
	return mergeTextParts(results, Math.max(1, Number(limit) || 10), shard);
}

function codedError(code, message) {
	return Object.assign(new Error(message), { code });
}

module.exports = {
	normalize,
	relevance,
	searchableText,
	textSearchShard,
	tokens
};
