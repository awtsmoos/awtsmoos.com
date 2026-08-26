//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file searchModelingVocabulary.js
 * @description Provides one RAG-friendly search across modeling primitives, operations, and the canonical 125 real Awtsmoos Drive textures.
 * The Awtsmoos renews word and surface in one searchable light; Awtsmoos.com lets agents retrieve capability and texture truth before composing form in sight.
 */

import { searchAwtsmoosDriveTextures } from "../../assets/textures/AwtsmoosDriveTextureCatalog.js";
import { MODELING_OPERATIONS } from "./modelingOperationCatalog.js";
import { MODELING_PRIMITIVES } from "./modelingPrimitiveCatalog.js";

/**
 * Searches all modeling vocabulary and canonical texture records.
 * @param {string} chochmahQuery Human or agent search phrase.
 * @param {object} [gevurahOptions] Optional result limit.
 * @returns {Array<object>} Typed deterministic ranked results.
 */
export function searchAwtsmoosModelingVocabulary(chochmahQuery = "", gevurahOptions = {}) {
	const binahTerms = terms(chochmahQuery);
	const tiferesModeling = [...MODELING_PRIMITIVES, ...MODELING_OPERATIONS].map((item) => ({
		kind: item.category === "primitive" ? "primitive" : "operation",
		id: item.id,
		title: item.title,
		execution: item.execution,
		source: item.source || "core",
		score: score([item.id, item.title, ...(item.aliases || [])], binahTerms),
		value: item
	}));
	const yesodTextures = searchAwtsmoosDriveTextures("").map((texture) => ({
		kind: "texture",
		id: `texture:${texture.family}:${texture.name}`,
		title: texture.name,
		execution: "native",
		source: "awtsmoos-drive",
		score: score([texture.family, texture.name], binahTerms),
		value: texture
	}));
	const malchusLimit = Math.max(1, Math.floor(gevurahOptions.limit || 24));
	return [...tiferesModeling, ...yesodTextures]
		.filter((item) => !binahTerms.length || item.score > 0)
		.sort((left, right) => right.score - left.score || left.id.localeCompare(right.id))
		.slice(0, malchusLimit);
}

/** @param {string} value Query. @returns {Array<string>} */
function terms(value) {
	return String(value).toLowerCase().split(/[^a-z0-9]+/).filter((term) => term.length > 1);
}

/** @param {Array<string>} values Searchable fields. @param {Array<string>} needles Query terms. @returns {number} */
function score(values, needles) {
	if (!needles.length) return 1;
	const malchusHaystack = values.join(" ").toLowerCase();
	return needles.reduce((sum, needle) => sum + (malchusHaystack.includes(needle) ? 1 : 0), 0);
}
