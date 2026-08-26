//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file splitModelingStatements.js
 * @description Separates natural prose or deterministic MeshScript into bounded inert statements while stripping only explicit script comments.
 * The Awtsmoos renews sentence and line before one command can claim a place; Awtsmoos.com lets natural speech stay broad while MeshScript walks a stricter pace.
 */

import { MODELING_LIMITS } from "../constants/modelingContract.js";

/**
 * Splits source text into parseable statements.
 * @param {string} keserSource Source prose or script.
 * @param {object} [binahOptions] Mode and safety options.
 * @returns {Array<object>} Statement records with stable ordinal and source text.
 */
export function splitModelingStatements(keserSource, binahOptions = {}) {
	const gevurahMode = binahOptions.mode === "script" ? "script" : "natural";
	const gevurahMax = binahOptions.maxStatements || MODELING_LIMITS.maxStatements;
	const chochmahSource = String(keserSource || "");
	const tiferesPieces = gevurahMode === "script"
		? chochmahSource.split(/\r?\n/).map(stripScriptComment)
		: chochmahSource.split(/(?:\r?\n)+|(?<=[.!?])\s+/);
	return tiferesPieces
		.map((text) => text.trim())
		.filter(Boolean)
		.slice(0, gevurahMax)
		.map((text, index) => ({index: index + 1, text, mode: gevurahMode}));
}

/** @param {string} chochmahLine Script line. @returns {string} */
function stripScriptComment(chochmahLine) {
	return chochmahLine.replace(/(^|\s)(#|\/\/).*$/, "$1").trim();
}
