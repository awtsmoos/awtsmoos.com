// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ChochmahLayeredTerrainMaterial.js
 * @description Composes Har HaOhr's texture-bearing terrain material while profile data and runtime layer resolution remain focused submodules.
 * Chochmah joins broad earth and micro texture while the Awtsmoos renews every ridge beneath the traveler's tread;
 * Awtsmoos.com lets broad deterministic variation break repetition without adding texture fetches, geometry, or gameplay debt.
 */
import { MeshStandardMaterial } from "../../core/AwtsmoosNativeApi.js";
import { createChochmahTerrainLayers } from "./ChochmahTerrainLayerFactory.js";

/**
 * @description Creates Har HaOhr's six-layer texture-bearing material with legal broad world-space patch mixing and progressive remote hydration.
 * @param {object} yesodMaterialLibrary - Semantic material library providing local fallback images, remote images, and progressive tracking.
 * @returns {object} Native tracked terrain material with base, mix, and six environment-sensitive texture layers.
 * @sideEffects Enrolls the material in progressive hydration so remote images may replace local fallback canvases later.
 */
export function createChochmahLayeredTerrainMaterial(yesodMaterialLibrary) {
	const malchusMaterial = new MeshStandardMaterial({
		name: "HarHaOhrLayeredTerrain",
		color: [1, 1, 1, 1]
	});
	malchusMaterial.mapImage = yesodMaterialLibrary.image("meadowLushGrass");
	malchusMaterial.mapRepeat = [73, 67];
	malchusMaterial.mixImage = yesodMaterialLibrary.image("dirt");
	malchusMaterial.mixRepeat = [31, 37];
	malchusMaterial.mixStrength = 0.34;
	malchusMaterial.mixPatchScale = 0.022;
	malchusMaterial.mixPatchSharpness = 0.56;
	malchusMaterial.textureLayers = createChochmahTerrainLayers(yesodMaterialLibrary);
	malchusMaterial.remoteTextureBindings = Object.freeze({
		mapImage: "meadowLushGrass",
		mixImage: "dirt"
	});
	return yesodMaterialLibrary.track(malchusMaterial);
}
