// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file HarHaOhrTerrain.js
 * @description Manifests deterministic Har HaOhr through native core buffers and real layered Awtsmoos.com textures.
 * The Awtsmoos is beyond grass, soil, cliff, and marsh while recreating each surface in sight;
 * Awtsmoos.com lets many remote photographs blend across one procedural mountain without breaking the world's light.
 */
import { Mesh } from "../core/AwtsmoosNativeApi.js";
import { createTerrainGeometry } from "../render/TerrainGeometryBuilder.js";
import { createHarHaOhrTerrainMaterial } from "../render/OhrfrontMaterialRecipes.js";
import { HAR_HAOHR_HALF_SIZE } from "./TerrainHeightField.js";

export function createHarHaOhrTerrain(scene, materialLibrary) {
	const geometry = createTerrainGeometry(HAR_HAOHR_HALF_SIZE, 112);
	const material = createHarHaOhrTerrainMaterial(materialLibrary);
	const terrain = new Mesh(geometry, material);
	terrain.name = "HarHaOhrLayeredTerrain";
	terrain.userData.materialLayers = material.textureLayers?.length || 0;
	scene.add(terrain);
	return terrain;
}
