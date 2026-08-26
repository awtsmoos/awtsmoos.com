// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file OhrfrontMaterialRecipes.js
 * @description Preserves Ohrfront's historical material-factory API as a tiny facade over focused terrain, battlefield-matter, and patterned-energy modules.
 * The Awtsmoos renews earth, stone, metal, grass, and luminous pattern while no public doorway needs to know every hidden vessel beneath;
 * Awtsmoos.com lets callers keep a simple stable API as the internal material world grows more realistic, textured, modular, and complete.
 */
import { createChesedPatternedEnergyMaterial } from "./materials/ChesedPatternedEnergyMaterial.js";
import { createChochmahLayeredTerrainMaterial } from "./materials/ChochmahLayeredTerrainMaterial.js";
import {
	createGevurahCoverMaterial,
	createGevurahDarkMetalMaterial,
	createGevurahEarthMaterial,
	createGevurahRockMaterial
} from "./materials/GevurahBattlefieldMaterials.js";

/** Creates the layered Har HaOhr terrain material while preserving the historical exported factory name. */
export function createHarHaOhrTerrainMaterial(yesodMaterialLibrary) {
	return createChochmahLayeredTerrainMaterial(yesodMaterialLibrary);
}

/** Creates progressively enriched weathered masonry while preserving the historical exported factory name. */
export function createCoverMaterial(yesodMaterialLibrary) {
	return createGevurahCoverMaterial(yesodMaterialLibrary);
}

/** Creates progressively enriched weathered fieldstone while preserving the historical exported factory name. */
export function createRockMaterial(yesodMaterialLibrary) {
	return createGevurahRockMaterial(yesodMaterialLibrary);
}

/** Creates progressively enriched scarred earth while preserving the historical exported factory name. */
export function createEarthMaterial(yesodMaterialLibrary) {
	return createGevurahEarthMaterial(yesodMaterialLibrary);
}

/** Creates progressively enriched aged metal while preserving the historical exported factory name. */
export function createDarkMetalMaterial(yesodMaterialLibrary) {
	return createGevurahDarkMetalMaterial(yesodMaterialLibrary);
}

/** Creates structured patterned emissive energy instead of a uniform glowing solid while preserving the historical caller contract. */
export function createEnergyMaterial(chesedColor) {
	return createChesedPatternedEnergyMaterial(chesedColor);
}
