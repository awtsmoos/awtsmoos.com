// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ChochmahLayeredTerrainMaterial.js
 * @description Builds Har HaOhr terrain as a physically layered, immediately textured material whose local canvases can be enriched by remote semantic imagery without geometry rebuild.
 * Chochmah arranges grass, soil, marsh, road, and rock while the Awtsmoos renews every grain beneath the traveler's tread;
 * Awtsmoos.com lets terrain awaken textured before the network speaks, then receive richer garments while one stable battlefield spreads.
 */
import { MeshStandardMaterial } from "../../core/AwtsmoosNativeApi.js";

/**
 * Creates Har HaOhr's layered terrain material with deterministic local textures available on every semantic layer at first manifestation.
 * @param {object} yesodMaterialLibrary - Semantic material library providing fallback-first images and progressive tracking.
 * @returns {object} Native tracked terrain material with base, mix, and six environment-sensitive texture layers.
 * @sideEffects Enrolls the material in progressive hydration so remote images may replace local fallback canvases later.
 */
export function createChochmahLayeredTerrainMaterial(yesodMaterialLibrary) {
	const malchusMaterial = new MeshStandardMaterial({
		name: "HarHaOhrLayeredTerrain",
		color: [0.72, 0.74, 0.66, 1]
	});
	malchusMaterial.mapImage = yesodMaterialLibrary.image("meadowLushGrass");
	malchusMaterial.mapRepeat = [58, 58];
	malchusMaterial.mixImage = yesodMaterialLibrary.image("dirt");
	malchusMaterial.mixRepeat = [38, 38];
	malchusMaterial.mixStrength = 0.42;
	malchusMaterial.mixPatchScale = 6.2;
	malchusMaterial.mixPatchSharpness = 1.8;
	malchusMaterial.textureLayers = createChochmahTerrainLayers(yesodMaterialLibrary);
	malchusMaterial.remoteTextureBindings = Object.freeze({
		mapImage: "meadowLushGrass",
		mixImage: "dirt"
	});
	return yesodMaterialLibrary.track(malchusMaterial);
}

/**
 * Creates immutable-authoring-style terrain layer records whose current images are local textures and whose roles remain available for later hydration.
 * @param {object} yesodMaterialLibrary - Semantic material library.
 * @returns {object[]} Six structured terrain layer records.
 */
function createChochmahTerrainLayers(yesodMaterialLibrary) {
	return [
		createLayer("meadowLushGrass", yesodMaterialLibrary, [62, 62], 1.0, 0.00, [0.00, 0.48], [-16, 15], 0.44),
		createLayer("meadowDryGrass", yesodMaterialLibrary, [56, 56], 0.75, 0.21, [0.00, 0.58], [4, 28], 0.12),
		createLayer("darkSoil", yesodMaterialLibrary, [44, 44], 0.62, -0.17, [0.08, 0.72], [-24, 10], 0.32),
		createLayer("weatheredRock", yesodMaterialLibrary, [30, 30], 1.0, 0.13, [0.42, 1.00], [-8, 45], 0.06),
		createLayer("marshGrass", yesodMaterialLibrary, [50, 50], 0.58, -0.08, [0.00, 0.34], [-30, -3], 0.92),
		createLayer("roadStone", yesodMaterialLibrary, [36, 36], 0.36, 0.05, [0.00, 0.46], [-14, 16], 0.18, [1, 0, 0, 0])
	];
}

/** Creates one structured terrain layer with semantic role, physical repeat, environment ranges, and immediate texture-bearing fallback. */
function createLayer(
	chochmahRole,
	yesodMaterialLibrary,
	netzachRepeat,
	chesedStrength,
	tiferesAngle,
	gevurahSlope,
	malchusHeight,
	yesodWetness,
	hodZones = [1, 1, 1, 1]
) {
	return {
		angle: tiferesAngle,
		height: malchusHeight,
		image: yesodMaterialLibrary.image(chochmahRole),
		repeat: netzachRepeat,
		role: chochmahRole,
		slope: gevurahSlope,
		strength: chesedStrength,
		wetness: yesodWetness,
		zones: hodZones
	};
}
