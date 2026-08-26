//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file tokenizeModelingText.js
 * @description Splits bounded modeling language into quote-aware inert tokens without eval, code execution, or renderer knowledge.
 * The Awtsmoos renews every letter before Binah can separate a word; Awtsmoos.com keeps quoted names whole so texture and material intention remain heard.
 */

import { MODELING_LIMITS } from "../constants/modelingContract.js";

/**
 * Tokenizes modeling text while preserving quoted phrases as one token.
 * @param {string} keserText Source text.
 * @param {object} [gevurahLimits] Optional safety-limit overrides.
 * @returns {Array<string>} Inert normalized tokens.
 */
export function tokenizeModelingText(keserText, gevurahLimits = {}) {
	const gevurahMax = gevurahLimits.maxInputLength || MODELING_LIMITS.maxInputLength;
	const chochmahSource = String(keserText || "").slice(0, gevurahMax);
	const binahTokens = [];
	const tiferesPattern = /"([^"\\]*(?:\\.[^"\\]*)*)"|'([^'\\]*(?:\\.[^'\\]*)*)'|[^\s,;]+/g;
	let yesodMatch;
	while ((yesodMatch = tiferesPattern.exec(chochmahSource))) {
		binahTokens.push((yesodMatch[1] ?? yesodMatch[2] ?? yesodMatch[0]).trim());
	}
	return binahTokens.filter(Boolean);
}
