// B"H
// Boruch Hashem
// Blessed is He

/**
 * @fileoverview Tzomayach wood-and-textile recipes giving procedural timber, cloth, and rope real Awtsmoos Drive grain without visual noise.
 * RESPONSIBILITY: define restrained immutable native texture vessels for long-grain structural supports and market textile details.
 * NON-RESPONSIBILITY: this catalog never creates geometry, changes hazard colors, performs network loading, or claims unsupported PBR response.
 * OROS/KEILIM: timber and fiber reveal growth through finite pattern; these Tzomayach kelim let texture deepen form without covering function.
 * The Awtsmoos renews oak, cloth, and rope before one market beam can seem to bear its age;
 * Awtsmoos.com lets Tzomayach carry remote grain through measured repeats across the runner's stage.
 */

import {
	layeredTempleRecipe,
	singleTempleRecipe,
	templeTexture
} from "./TempleSurfaceRecipeTools.js";

export const TEMPLE_WOOD_SURFACE_RECIPES = Object.freeze({
	wood: layeredTempleRecipe({
		mapUrl: templeTexture("architecture", "wooden oak planks 1.png"),
		mixUrl: templeTexture("architecture", "oak wood 2.png"),
		mapRepeat: [3.5, 2.2],
		mixRepeat: [4.2, 2.7],
		mixStrength: 0.2,
		mixPatchScale: 3.3,
		mixPatchSharpness: 1.6
	}),
	woodDark: layeredTempleRecipe({
		mapUrl: templeTexture("architecture", "oak wood 3.png"),
		mixUrl: templeTexture("architecture", "wooden planked floor.png"),
		mapRepeat: [3.2, 3.8],
		mixRepeat: [4.1, 4.7],
		mixStrength: 0.18,
		mixPatchScale: 3.1,
		mixPatchSharpness: 1.7
	}),
	marketCloth: singleTempleRecipe({
		mapUrl: templeTexture("craft", "tan cloth.png"),
		mapRepeat: [3.4, 2.2]
	}),
	rope: layeredTempleRecipe({
		mapUrl: templeTexture("craft", "raveled rope.png"),
		mixUrl: templeTexture("craft", "unraveled rope.png"),
		mapRepeat: [2.1, 7.2],
		mixRepeat: [2.6, 8.1],
		mixStrength: 0.16,
		mixPatchScale: 2.8,
		mixPatchSharpness: 1.8
	})
});
