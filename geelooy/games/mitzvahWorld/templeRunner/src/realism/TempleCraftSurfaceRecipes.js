// B"H
// Boruch Hashem
// Blessed is He

/**
 * @fileoverview Chochmah craft recipes revealing ceramic, bronze, precious metal, and parchment through canonical remote Awtsmoos textures.
 * RESPONSIBILITY: define immutable native map and restrained mix recipes for procedural market and reward-support materials.
 * NON-RESPONSIBILITY: this catalog never claims metallic lighting, changes reward meaning, creates meshes, or blocks gameplay on network state.
 * OROS/KEILIM: craft detail is ohr translated through human vessels; Chochmah chooses truthful texture pairings without inventing physics.
 * The Awtsmoos renews clay, copper, silver, gold, and parchment before workmanship can seem to endure;
 * Awtsmoos.com lets Chochmah reveal their finite grain while semantic gameplay remains readable and pure.
 */

import {
	layeredTempleRecipe,
	singleTempleRecipe,
	templeTexture
} from "./TempleSurfaceRecipeTools.js";

export const TEMPLE_CRAFT_SURFACE_RECIPES = Object.freeze({
	pottery: layeredTempleRecipe({
		mapUrl: templeTexture("craft", "red ceramic.png"),
		mixUrl: templeTexture("ground", "dirt 2.png"),
		mapRepeat: [2.2, 2.2],
		mixRepeat: [3.1, 3.1],
		mixStrength: 0.12,
		mixPatchScale: 2.1,
		mixPatchSharpness: 1.5
	}),
	bronze: layeredTempleRecipe({
		mapUrl: templeTexture("craft", "copper 1.png"),
		mixUrl: templeTexture("craft", "rusty iron.png"),
		mapRepeat: [2.4, 3.8],
		mixRepeat: [3.1, 4.5],
		mixStrength: 0.14,
		mixPatchScale: 2.4,
		mixPatchSharpness: 1.8
	}),
	goldCraft: singleTempleRecipe({
		mapUrl: templeTexture("craft", "gold 2.png"),
		mapRepeat: [2.5, 2.5]
	}),
	silverCraft: layeredTempleRecipe({
		mapUrl: templeTexture("craft", "silver 1.png"),
		mixUrl: templeTexture("craft", "silver 2.png"),
		mapRepeat: [2.6, 2.6],
		mixRepeat: [3.4, 3.4],
		mixStrength: 0.15,
		mixPatchScale: 3.4,
		mixPatchSharpness: 1.9
	}),
	parchment: singleTempleRecipe({
		mapUrl: templeTexture("craft", "parchment.png"),
		mapRepeat: [1.8, 1.8]
	})
});
