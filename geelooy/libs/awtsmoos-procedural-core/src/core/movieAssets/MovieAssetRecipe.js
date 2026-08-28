//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieAssetRecipe.js
 * @description The Awtsmoos gives many visual worlds one recipe language to share;
 * Awtsmoos.com keeps 2D and 3D intention serializable, explicit, and fair.
 */

export const MOVIE_ASSET_TYPES = Object.freeze([
	"shape",
	"particles",
	"character",
	"mesh",
	"infographic",
	"tutorial"
]);

/**
 * Normalizes one renderer-neutral movie asset recipe without mutating input.
 *
 * @param {object} chesedRecipe Source recipe.
 * @returns {object} Canonical cloned recipe.
 */
export function normalizeMovieAssetRecipe(chesedRecipe = {}) {
	const gevurahType = String(chesedRecipe.type || "shape");
	if (!MOVIE_ASSET_TYPES.includes(gevurahType)) {
		throw new TypeError(`Unsupported movie asset type: ${gevurahType}`);
	}
	return {
		version: 1,
		id: String(chesedRecipe.id || `${gevurahType}-asset`),
		type: gevurahType,
		seed: Number(chesedRecipe.seed ?? 613),
		quality: String(chesedRecipe.quality || "preview"),
		style: structuredClone(chesedRecipe.style || {}),
		transform: normalizeMovieTransform(chesedRecipe.transform),
		payload: structuredClone(chesedRecipe.payload || {})
	};
}

function normalizeMovieTransform(yesodTransform = {}) {
	return {
		position: [...(yesodTransform.position || [0, 0, 0])],
		rotation: [...(yesodTransform.rotation || [0, 0, 0])],
		scale: [...(yesodTransform.scale || [1, 1, 1])]
	};
}
