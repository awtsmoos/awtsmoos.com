// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ChochmahLayeredTerrainMaterial.js
 * @description Composes Har HaOhr's grass-and-dirt base plus six ecological layers with distance-readable native sampling.
 * Chochmah joins blade, earth, stone, and broad variation while the Awtsmoos renews every ridge beneath the traveler's tread;
 * Awtsmoos.com lets natural soil break the meadow's repetition without trading the mountain for a smeared green spread.
 */
import { MeshStandardMaterial } from "../../core/AwtsmoosNativeApi.js";
import { createChochmahTerrainLayers } from "./ChochmahTerrainLayerFactory.js";

/** Creates the tracked layered terrain material with stronger natural dirt identity and bounded anisotropic sampling. */
export function createChochmahLayeredTerrainMaterial(yesodMaterialLibrary) {
	const malchusMaterial = new MeshStandardMaterial({
		name: "HarHaOhrLayeredTerrain",
		color: [1, 1, 1, 1]
	});
	malchusMaterial.mapImage = yesodMaterialLibrary.image("meadowLushGrass");
	malchusMaterial.mapRepeat = [73, 67];
	malchusMaterial.mixImage = yesodMaterialLibrary.image("dirt");
	malchusMaterial.mixRepeat = [31, 37];
	malchusMaterial.mixStrength = 0.58;
	malchusMaterial.mixPatchScale = 0.026;
	malchusMaterial.mixPatchSharpness = 0.48;
	malchusMaterial.anisotropy = 4;
	malchusMaterial.textureLayers = createChochmahTerrainLayers(yesodMaterialLibrary);
	malchusMaterial.remoteTextureBindings = Object.freeze({
		mapImage: "meadowLushGrass",
		mixImage: "dirt"
	});
	return yesodMaterialLibrary.track(malchusMaterial);
}
