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
 * English function words carry no evidence of their own: a lone whole-word
 * match on "the" once scored exactly 3/(3n+8) and surfaced as a result, so a
 * hit now needs at least one content-token match (or an exact identity or
 * full-phrase match) before it may be shown.
 */

const {
	normalizeSearchText,
	tokenize
} = require('../../../../../../ayzarim/DosDB/awtsmoosBinary/awtsmoosDB/api/search/indexer/tokenizer.js');
const { aliasesForRow } = require('./sourceWorkIdentity.js');

const EXACT_TITLE_SCORE = 4;
const EXACT_IDENTITY_SCORE = 3;
const WORD_BOUNDARIES = /[^\p{L}\p{N}]+/gu;

/**
 * English function words: grammar glue, never topical evidence. Hebrew tokens
 * are never in this set, so Hebrew lexical search is untouched by the floor.
 */
const STOPWORDS = new Set([
	'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an',
	'and', 'any', 'are', 'as', 'at', 'be', 'because', 'been', 'before',
	'being', 'below', 'between', 'both', 'but', 'by', 'could', 'did', 'do',
	'does', 'doing', 'down', 'during', 'each', 'few', 'for', 'from',
	'further', 'had', 'has', 'have', 'having', 'he', 'her', 'here', 'hers',
	'him', 'his', 'how', 'i', 'if', 'in', 'into', 'is', 'it', 'its', 'just',
	'me', 'more', 'most', 'my', 'no', 'nor', 'not', 'now', 'of', 'off',
	'on', 'once', 'only', 'or', 'other', 'ought', 'our', 'out', 'over',
	'own', 'same', 'she', 'should', 'so', 'some', 'such', 'than', 'that',
	'the', 'their', 'them', 'then', 'there', 'these', 'they', 'this',
	'those', 'through', 'to', 'too', 'under', 'until', 'up', 'very', 'was',
	'we', 'were', 'what', 'when', 'where', 'which', 'while', 'who', 'why',
	'will', 'with', 'would', 'you', 'your'
]);

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

/** Reports whether one normalized token is an English function word. */
function isStopword(token) {
	return STOPWORDS.has(String(token || ''));
}

/** Returns only the query tokens that can carry topical evidence. */
function contentTokens(queryTokens = []) {
	return queryTokens.filter(token => !isStopword(token));
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

/**
 * Scores one row and reports the evidence behind the score. `contentMatch`
 * is true only when a non-stopword query token matched the row (as the whole
 * haystack, a whole word, or a substring); `phraseMatch` is a full-phrase
 * hit. Exact title/identity matches short-circuit with their fixed scores.
 */
function relevanceEvidence(row, queryText, queryTokens) {
	const none = { score: 0, contentMatch: false, phraseMatch: false, exact: false };
	if (!queryText) return none;
	if (directTitles(row).includes(queryText)) {
		return { score: EXACT_TITLE_SCORE, contentMatch: true, phraseMatch: true, exact: true };
	}
	if (canonicalIdentities(row).includes(queryText)) {
		return { score: EXACT_IDENTITY_SCORE, contentMatch: true, phraseMatch: true, exact: true };
	}
	const haystack = searchableText(row);
	if (!haystack) return none;
	const phraseMatch = haystack.includes(queryText);
	let score = phraseMatch ? 8 : 0;
	let contentMatch = phraseMatch;
	for (const token of queryTokens) {
		let points = 0;
		if (haystack === token) points = 5;
		else if (haystack.includes(` ${token} `)) points = 3;
		else if (haystack.includes(token)) points = 1;
		if (!points) continue;
		if (!isStopword(token)) contentMatch = true;
		score += points;
	}
	return {
		score: score / Math.max(1, queryTokens.length * 3 + 8),
		contentMatch,
		phraseMatch,
		exact: false
	};
}

/**
 * Ranks exact identity first, then phrase and token evidence inside candidate
 * rows. The relevance floor lives here so both text paths (native postings
 * and the legacy sidecar mirror) share it: when the query carries content
 * tokens, a row with no content-token evidence scores 0 and is dropped by
 * the callers' shared `score <= 0` keep rule — an honest no-result instead
 * of stopword junk. A query made only of function words has no searchable
 * evidence at all, so only exact identity matches may score for it.
 */
function relevance(row, queryText, queryTokens) {
	const evidence = relevanceEvidence(row, queryText, queryTokens);
	if (evidence.exact) return evidence.score;
	if (!contentTokens(queryTokens).length) return 0;
	return evidence.contentMatch ? evidence.score : 0;
}

function uniqueNormalized(values) {
	return [...new Set(values.map(normalize).filter(Boolean))];
}

module.exports = {
	EXACT_IDENTITY_SCORE,
	EXACT_TITLE_SCORE,
	STOPWORDS,
	canonicalIdentities,
	contentTokens,
	directTitles,
	isStopword,
	normalize,
	relevance,
	relevanceEvidence,
	searchableText,
	tokens,
	uniqueNormalized
};
