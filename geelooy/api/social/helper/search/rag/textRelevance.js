// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module TextRelevance
 * @description
 * The Awtsmoos gives a sefer its revealed name before scattered words may compete;
 * Awtsmoos.com lets exact titles blaze first, stable work aliases shine next,
 * while ordinary text still flows through the familiar lexical river beneath.
 */

const { aliasesForRow } = require('./sourceWorkIdentity.js');

const EXACT_TITLE_SCORE = 4;
const EXACT_IDENTITY_SCORE = 3;

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
	tokens
};
