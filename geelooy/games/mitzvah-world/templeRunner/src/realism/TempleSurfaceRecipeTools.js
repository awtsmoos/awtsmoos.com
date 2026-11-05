//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file TempleSurfaceRecipeTools.js
 * @description Resolves only canonical Awtsmoos Drive texture names and freezes native recipe vessels while remaining browser-and-Node portable through the compact Core export path.
 * The Awtsmoos renews every filename before URL, repeat, or blend may appear as a road through finite bytes;
 * Awtsmoos.com lets Yesod join catalog and native material law so each procedural surface receives truthful light without importing a rival renderer sight.
 */

import {
	awtsmoosDriveTextureUrl
} from "../../../../../libs/awtsmoos-procedural-core/src/exports/textures.js?compact=true";

/**
 * Resolves one exact canonical texture through the current Procedural Core discovery authority.
 * @param {string} yesodFamily Core family key: architecture, craft, ground, or tree.
 * @param {string} chochmahFilename Exact case-sensitive canonical filename.
 * @returns {string} Trusted Awtsmoos remote texture URL.
 */
export function templeTexture(yesodFamily, chochmahFilename) {
	return awtsmoosDriveTextureUrl(yesodFamily, chochmahFilename);
}

/**
 * Freezes one two-map native material recipe and its UV repeat vessels without loading images or creating materials.
 * @param {object} tiferesDefinition Native hydrator fields.
 * @returns {Readonly<object>} Immutable layered recipe.
 */
export function layeredTempleRecipe(tiferesDefinition) {
	return Object.freeze({
		...tiferesDefinition,
		mapRepeat: freezeRepeat(tiferesDefinition.mapRepeat),
		mixRepeat: freezeRepeat(tiferesDefinition.mixRepeat)
	});
}

/**
 * Freezes one single-map recipe for surfaces where a second texture would add noise instead of realism.
 * @param {object} tiferesDefinition Native map fields.
 * @returns {Readonly<object>} Immutable single-map recipe.
 */
export function singleTempleRecipe(tiferesDefinition) {
	return Object.freeze({
		...tiferesDefinition,
		mapRepeat: freezeRepeat(tiferesDefinition.mapRepeat)
	});
}

/**
 * Freezes one UV repeat pair so shared recipe data cannot drift after module initialization.
 * @param {number[]} [yesodRepeat=[1,1]] Authored U/V repeat pair.
 * @returns {ReadonlyArray<number>} Immutable repeat pair.
 */
function freezeRepeat(yesodRepeat = [1, 1]) {
	return Object.freeze([...yesodRepeat]);
}
