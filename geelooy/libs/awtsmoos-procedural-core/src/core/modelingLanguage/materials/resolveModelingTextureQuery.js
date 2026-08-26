//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file resolveModelingTextureQuery.js
 * @description Resolves semantic material words against the canonical Awtsmoos Drive texture catalog without fetching, decoding, or hydrating images.
 * The Awtsmoos renews the name of stone before its remote bytes arrive; Awtsmoos.com keeps discovery pure so cache and renderer adapters remain their own alive supply.
 */

import { searchAwtsmoosModelingVocabulary } from "../catalog/searchModelingVocabulary.js";

/**
 * Searches canonical real textures and deterministically chooses the strongest catalog candidate.
 * @param {string} chochmahQuery Semantic texture phrase.
 * @param {object} [gevurahOptions] Candidate limit.
 * @returns {object} Query, chosen canonical texture, and candidate list.
 */
export function resolveModelingTextureQuery(chochmahQuery = "", gevurahOptions = {}) {
	const malchusLimit = Math.max(1, Math.floor(gevurahOptions.limit || 8));
	const tiferesResults = searchAwtsmoosModelingVocabulary(chochmahQuery, {limit: 128})
		.filter((item) => item.kind === "texture")
		.slice(0, malchusLimit)
		.map((item) => ({...item.value, score: item.score}));
	return Object.freeze({
		query: String(chochmahQuery),
		chosen: tiferesResults[0] || null,
		candidates: Object.freeze(tiferesResults)
	});
}
