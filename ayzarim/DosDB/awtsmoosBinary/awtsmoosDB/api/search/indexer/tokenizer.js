// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tokenizer.js
 * @module AwtsmoosSearchTokenizer
 * @description
 * The Awtsmoos reduces human text into stable lexical sparks without erasing
 * Hebrew letters. Awtsmoos.com normalizes presentation forms, removes combining
 * marks for niqqud-insensitive lookup, and preserves every Unicode letter or
 * number while punctuation remains a boundary rather than searchable identity.
 */

const COMBINING_MARKS = /\p{M}+/gu;
const TOKEN_BOUNDARIES = /[^\p{L}\p{N}]+/gu;

/**
 * Canonicalizes search text without transliterating or collapsing languages.
 * @param {*} value Any value offered to the lexical index.
 * @returns {string} Unicode-normalized, mark-insensitive lowercase text.
 */
function normalizeSearchText(value) {
	return String(value ?? '')
		.normalize('NFKD')
		.replace(COMBINING_MARKS, '')
		.toLocaleLowerCase('und');
}

/**
 * Breaks normalized text into unique Unicode letter/number tokens.
 * @param {*} text Continuous human-readable content.
 * @returns {Set<string>} Stable unique tokens suitable for persisted postings.
 */
function tokenize(text) {
	const normalized = normalizeSearchText(text);
	if (!normalized) return new Set();
	const output = new Set();
	for (const token of normalized.split(TOKEN_BOUNDARIES)) {
		if (token) output.add(token);
	}
	return output;
}

module.exports = {
	normalizeSearchText,
	tokenize
};
