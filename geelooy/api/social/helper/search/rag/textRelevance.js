// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file textRelevance.js
 * @module TextRelevance
 * @description
 * The Awtsmoos ranks canonical Torah identity before scattered lexical sparks.
 * Awtsmoos.com shares the native Unicode tokenizer's normalization law so
 * pointed and unpointed Hebrew remain one searchable word without transliteration.
 */

const {
	normalizeSearchText,
	tokenize
} = require('../../../../../../ayzarim/DosDB/awtsmoosBinary/awtsmoosDB/api/search/indexer/tokenizer.js');
const { aliasesForRow } = require('./sourceWorkIdentity.js');

const EXACT_TITLE_SCORE = 4;
const EXACT_IDENTITY_SCORE = 3;
const WORD_BOUNDARIES = /[^\p{L}\p{N}]+/gu;

/** Canonicalizes display/search text with the exact native index normalization. */
function normalize(value) {
	return normalizeSearchText(value)
		.replace(WORD_BOUNDARIES, ' ')
		.trim();
}

/** Returns stable unique query tokens in native index form. */
function tokens(query) {
	return [...tokenize(query)];
}

function directTitles(row = {}) {
	return uniqueNormalized([
		row.title,
		row.sourceTitle,
		row.seriesTitle,
		row.postTitle
	]);
}

function canonicalIdentities(row = {}) {
	return uniqueNormalized([
		...directTitles(row),
		...aliasesForRow(row)
	]);
}

function searchableText(row = {}) {
	return normalize([
		row.text,
		row.previewEnglish,
		row.sampleContent,
		row.content,
		row.postId,
		row.seriesId,
		...canonicalIdentities(row)
	].filter(Boolean).join(' '));
}

/** Ranks exact identity first, then phrase and token evidence inside candidate rows. */
function relevance(row, queryText, queryTokens) {
	if (!queryText) return 0;
	if (directTitles(row).includes(queryText)) return EXACT_TITLE_SCORE;
	if (canonicalIdentities(row).includes(queryText)) return EXACT_IDENTITY_SCORE;
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

function uniqueNormalized(values) {
	return [...new Set(values.map(normalize).filter(Boolean))];
}

module.exports = {
	EXACT_IDENTITY_SCORE,
	EXACT_TITLE_SCORE,
	canonicalIdentities,
	directTitles,
	normalize,
	relevance,
	searchableText,
	tokens,
	uniqueNormalized
};
