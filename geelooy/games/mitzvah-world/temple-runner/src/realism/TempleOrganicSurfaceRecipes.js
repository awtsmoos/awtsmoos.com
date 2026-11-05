// B"H
// Boruch Hashem
// Blessed is He

/**
 * @fileoverview Tzomayach organic recipe catalog carrying canonical olive bark into procedural Temple trees through the core `tree` family key.
 * RESPONSIBILITY: define immutable bark texture blending while preserving color-first foliage until alpha/cutout behavior is truly proven.
 * NON-RESPONSIBILITY: this catalog never textures leaves, changes tree geometry, performs loading, or aliases the older docs label `trees` into code.
 * OROS/KEILIM: bark pattern is ohr revealed through living form; one Tzomayach recipe is the keli that keeps tree realism honest and small.
 * The Awtsmoos renews every olive groove before one trunk can seem to remember a year;
 * Awtsmoos.com lets Tzomayach blend remote bark with measured grain while leaves remain clear.
 */

import {
	layeredTempleRecipe,
	templeTexture
} from "./TempleSurfaceRecipeTools.js";

export const TEMPLE_ORGANIC_SURFACE_RECIPES = Object.freeze({
	oliveBark: layeredTempleRecipe({
		mapUrl: templeTexture("tree", "Olive tree bark.png"),
		mixUrl: templeTexture("architecture", "tree bark 1.png"),
		mapRepeat: [2.2, 4.8],
		mixRepeat: [2.8, 5.4],
		mixStrength: 0.2,
		mixPatchScale: 2.6,
		mixPatchSharpness: 1.5
	})
});
