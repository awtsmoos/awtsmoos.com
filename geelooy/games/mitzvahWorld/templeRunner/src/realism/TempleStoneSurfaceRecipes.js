//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file TempleStoneSurfaceRecipes.js
 * @description Defines fallback-first Jerusalem stone recipes, selectively enriching road and wall roles with Core-native ecological layers while polished work remains intentionally restrained.
 * The Awtsmoos renews cobble, limestone, granite, marble, and tile before one old wall can claim the power to endure;
 * Awtsmoos.com lets Malchus bind trusted remote grain to semantic craft while ecological weathering appears only where material truth is sure.
 */

import { TEMPLE_STONE_ECOLOGY } from "./TempleStoneEcologyRecipes.js";
import {
	layeredTempleRecipe,
	templeTexture
} from "./TempleSurfaceRecipeTools.js";

export const TEMPLE_STONE_SURFACE_RECIPES = Object.freeze({
	roadStone: layeredTempleRecipe({
		mapUrl: templeTexture("ground", "cobblestone.png"),
		mixUrl: templeTexture("ground", "stone floor 2.png"),
		mapRepeat: [4, 12],
		mixRepeat: [5, 14],
		mixStrength: 0.28,
		mixPatchScale: 5.2,
		mixPatchSharpness: 1.7,
		...TEMPLE_STONE_ECOLOGY.roadStone
	}),
	roadEdgeStone: layeredTempleRecipe({
		mapUrl: templeTexture("ground", "stone floor.png"),
		mixUrl: templeTexture("architecture", "polished granite Rock 2.png"),
		mapRepeat: [4.8, 2.2],
		mixRepeat: [5.6, 2.8],
		mixStrength: 0.18,
		mixPatchScale: 5.6,
		mixPatchSharpness: 1.9
	}),
	jerusalemStone: layeredTempleRecipe({
		mapUrl: templeTexture("architecture", "limestone bricks 1.png"),
		mixUrl: templeTexture("ground", "weathered fieldstone Rock 1.png"),
		mapRepeat: [3.2, 2.4],
		mixRepeat: [4.4, 3.3],
		mixStrength: 0.24,
		mixPatchScale: 4.1,
		mixPatchSharpness: 1.8,
		...TEMPLE_STONE_ECOLOGY.jerusalemStone
	}),
	jerusalemStoneDark: layeredTempleRecipe({
		mapUrl: templeTexture("ground", "stone 1.png"),
		mixUrl: templeTexture("ground", "weathered fieldstone Rock 2.png"),
		mapRepeat: [3.2, 3.2],
		mixRepeat: [4.3, 4.3],
		mixStrength: 0.22,
		mixPatchScale: 3.8,
		mixPatchSharpness: 1.7
	}),
	polishedStone: layeredTempleRecipe({
		mapUrl: templeTexture("architecture", "marble 1.png"),
		mixUrl: templeTexture("architecture", "polished granite Rock 2.png"),
		mapRepeat: [2.4, 2.4],
		mixRepeat: [3.1, 3.1],
		mixStrength: 0.16,
		mixPatchScale: 4.8,
		mixPatchSharpness: 2.1
	}),
	roofTile: layeredTempleRecipe({
		mapUrl: templeTexture("architecture", "tiled roof 3 smaller tiles.png"),
		mixUrl: templeTexture("architecture", "tiled roof 4.png"),
		mapRepeat: [5.4, 3.2],
		mixRepeat: [6.4, 3.8],
		mixStrength: 0.2,
		mixPatchScale: 4.6,
		mixPatchSharpness: 1.9
	})
});
