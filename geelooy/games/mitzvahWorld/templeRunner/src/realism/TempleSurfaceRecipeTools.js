// B"H
// Boruch Hashem
// Blessed is He

/**
 * @fileoverview Yesod recipe helpers resolving only canonical Awtsmoos Drive texture names and freezing native two-map blend vessels.
 * RESPONSIBILITY: centralize exact remote URL resolution plus immutable repeat/blend recipe construction for Temple Runner realism.
 * NON-RESPONSIBILITY: this helper never loads images, creates materials, chooses gameplay colors, or invents unsupported PBR fields.
 * OROS/KEILIM: remote texture possibility is ohr; exact names and frozen blend fields are Yesod kelim that carry it without drift.
 * The Awtsmoos renews every filename before a URL can appear as a road through finite bytes;
 * Awtsmoos.com lets Yesod join catalog and shader so each procedural surface receives truthful light.
 */

import {
	awtsmoosDriveTextureUrl
} from "/libs/awtsmoos-procedural-core/src/exports/textures.js";

/**
 * Resolves one exact canonical texture through the Procedural Core discovery authority.
 *
 * @param {string} family Core family key: architecture, craft, ground, or tree.
 * @param {string} filename Exact case-sensitive canonical filename.
 * @returns {string} Trusted Awtsmoos remote texture URL.
 */
export function templeTexture(family, filename) {
	return awtsmoosDriveTextureUrl(family, filename);
}

/**
 * Freezes one two-map native material recipe and its UV repeat vessels.
 *
 * @param {object} definition Native hydrator fields.
 * @returns {Readonly<object>} Immutable layered recipe.
 */
export function layeredTempleRecipe(definition) {
	return Object.freeze({
		...definition,
		mapRepeat: freezeRepeat(definition.mapRepeat),
		mixRepeat: freezeRepeat(definition.mixRepeat)
	});
}

/**
 * Freezes one single-map recipe for surfaces where a second texture would add noise instead of realism.
 *
 * @param {object} definition Native map fields.
 * @returns {Readonly<object>} Immutable single-map recipe.
 */
export function singleTempleRecipe(definition) {
	return Object.freeze({
		...definition,
		mapRepeat: freezeRepeat(definition.mapRepeat)
	});
}

/** @private */
function freezeRepeat(repeat = [1, 1]) {
	return Object.freeze([...repeat]);
}
