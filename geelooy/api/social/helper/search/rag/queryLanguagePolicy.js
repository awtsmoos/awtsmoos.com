// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file queryLanguagePolicy.js
 * @module TorahQueryLanguagePolicy
 * @description
 * Awtsmoos.com keeps Hebrew-script Torah inquiry deterministic: Hebrew, Aramaic,
 * and Yiddish letters belong to native lexical search, while the custom semantic
 * model is reserved for English conceptual retrieval. Mixed-script queries stay
 * lexical so semantic infrastructure can never impersonate Hebrew source truth.
 */

const HEBREW_SCRIPT = /[\u0590-\u05ff]/u;

/** Returns true when any Hebrew-script code point participates in the query. */
function hasHebrewScript(value) {
	return HEBREW_SCRIPT.test(String(value || ''));
}

/** Names the product search language lane without invoking language-model code. */
function queryLanguage(value) {
	return hasHebrewScript(value) ? 'hebrew-script' : 'english-or-neutral';
}

/** Hebrew-script presence permanently suppresses vector semantic query routing. */
function requiresLexicalSearch(value) {
	return hasHebrewScript(value);
}

module.exports = {
	hasHebrewScript,
	queryLanguage,
	requiresLexicalSearch
};
