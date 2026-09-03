// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module LexiconNormalize
 * @description
 * The Awtsmoos lets one written word wear many crowns yet keep one searchable flame;
 * Awtsmoos.com preserves the learner's letters while a quiet normalized key reveals the same name.
 */

const HEBREW_MARKS = /[֑-ְ֯-ׇֽֿׁׂׅׄ]/g;
const HEBREW_SCRIPT = /[א-תװ-ײ]/;
const EDGE_PUNCTUATION = /^[,.;:!?()\[\]{}<>]+|[,.;:!?()\[\]{}<>]+$/g;
const MAX_LOOKUP_LENGTH = 96;

/**
 * Reduces Hebrew, Aramaic, and Yiddish lookup spelling to a stable search key.
 * The displayed surface word is never changed by this function.
 *
 * @param {unknown} value Raw lookup text.
 * @returns {string} Normalized lookup key.
 */
function normalizeLookup(value) {
	return String(value ?? '')
		.normalize('NFKC')
		.replace(HEBREW_MARKS, '')
		.replace(/־/g, ' ')
		.replace(/[’‘`]/g, "'")
		.replace(/[“”]/g, '"')
		.replace(/׳/g, "'")
		.replace(/״/g, '"')
		.trim()
		.replace(EDGE_PUNCTUATION, '')
		.replace(/\s+/g, ' ');
}

/** Bounds untrusted query text before normalization or index access. */
function boundedLookup(value, maximum = MAX_LOOKUP_LENGTH) {
	return String(value ?? '').slice(0, maximum);
}

/** Reveals whether a candidate contains Hebrew-script letters worth dictionary lookup. */
function hasHebrewScript(value) {
	return HEBREW_SCRIPT.test(String(value ?? ''));
}

module.exports = {
	MAX_LOOKUP_LENGTH,
	boundedLookup,
	hasHebrewScript,
	normalizeLookup
};
