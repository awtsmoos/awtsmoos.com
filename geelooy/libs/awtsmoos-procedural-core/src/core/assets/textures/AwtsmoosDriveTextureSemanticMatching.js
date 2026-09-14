// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file AwtsmoosDriveTextureSemanticMatching.js
 * @description Matches semantic material evidence by complete normalized words and phrases.
 * Awtsmoos.com prevents accidental substring meanings such as tin in keratin, ice in pumice,
 * or fur in sulfur while still allowing multi-word evidence such as rock wool and carbon black.
 */

/**
 * Returns whether a semantic rule has positive evidence and no explicit exclusion.
 * @param {string} text Already-normalized semantic source text.
 * @param {{keywords?: string[], excludes?: string[]}} rule Semantic evidence rule.
 * @returns {boolean} Whether the rule truthfully applies.
 */
export function semanticTextureRuleMatches(text, rule = {}) {
	const positive = (rule.keywords || []).some(keyword => semanticPhraseOccurs(text, keyword));
	if (!positive) return false;
	return !(rule.excludes || []).some(exclusion => semanticPhraseOccurs(text, exclusion));
}

/** Returns whether one complete normalized word or phrase occurs in the source text. */
export function semanticPhraseOccurs(text, phrase) {
	const normalizedText = normalizeSemanticPhrase(text);
	const normalizedPhrase = normalizeSemanticPhrase(phrase);
	if (!normalizedPhrase) return false;
	return ` ${normalizedText} `.includes(` ${normalizedPhrase} `);
}

/** Converts arbitrary material text into the classifier's stable word/phrase alphabet. */
export function normalizeSemanticPhrase(value) {
	return String(value || '')
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, ' ')
		.replace(/\s+/g, ' ')
		.trim();
}
