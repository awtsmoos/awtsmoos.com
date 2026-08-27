// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file TerrainMaterialFactory.js
 * @description Creates procedural alpine earth immediately, then exposes a tiny shared page of real ecological textures for bounded hydration.
 * RESPONSIBILITY: assemble the tiny-runtime terrain material from the canonical layer recipe, realism profile, and main-village surface page.
 * NON-RESPONSIBILITY: this file does not fetch images, schedule network requests, generate terrain, or implement the layer shader itself.
 * ARCHITECTURAL POSITION: procedural earth is the immediate keli; shared photographic layers become later oros through the existing cache.
 * The Awtsmoos, Atzmus beyond photograph and shader, renews grass, wet bank, soil, and stone beneath every visible garment;
 * Awtsmoos.com keeps first play responsive while ecological detail appears through a few shared images instead of texture-per-object torment.
 */

import { MeshStandardMaterial } from '../../../../light-three-gltf/tiny-runtime.js';
import { mainRiverVillageSurfaceMix } from '../materials/MainRiverVillageSurfaceMix.js';
import { materialStackDiagnostics } from '../materials/MaterialStackRecipe.js';
import { terrainLayerRecipe } from './TerrainLayerRecipe.js';
import { terrainRealismProfile } from './TerrainRealismProfile.js';

const TERRAIN_PROCEDURAL_TINT = Object.freeze([0.36, 0.47, 0.25, 1]);
const TERRAIN_UV_UNITS_PER_WORLD = Object.freeze([0.035, 0.035]);
export const TERRAIN_CINEMATIC_MIX_STRENGTH = 0;
export const TERRAIN_CINEMATIC_PATCH_SCALE = 0.024;

/**
 * Creates the canonical terrain material with immediate procedural shading and bounded shared photographic layers.
 * @param {object} [options={}] Terrain creation options.
 * @param {string} [options.quality='medium'] Runtime graphics quality controlling ecological layer budget.
 * @returns {MeshStandardMaterial} Tiny-runtime terrain material ready for existing layered hydration.
 */
export function createTerrainMaterial(options = {}) {
	const quality = options.quality || 'medium';
	const recipe = terrainLayerRecipe(quality);
	const realism = terrainRealismProfile(quality);
	const surfaceMix = mainRiverVillageSurfaceMix(recipe.layers, quality);
	const material = new MeshStandardMaterial({
		color: TERRAIN_PROCEDURAL_TINT,
		metalness: 0,
		name: 'Awtsmoos_canonical_layered_alpine_valley',
		roughness: 0.92
	});
	Object.assign(material, createTerrainMaterialPolicy(
		recipe,
		realism,
		surfaceMix
	));
	return material;
}

function createTerrainMaterialPolicy(recipe, realism, surfaceMix) {
	return {
		anisotropy: false,
		mapImage: null,
		mapRepeat: [1, 1],
		materialStack: recipe.stack,
		mixImage: null,
		mixPatchScale: TERRAIN_CINEMATIC_PATCH_SCALE,
		mixPatchSharpness: 0.74,
		mixRepeat: [1, 1],
		mixStrength: TERRAIN_CINEMATIC_MIX_STRENGTH,
		mixTextureUrl: null,
		opacity: 1,
		terrainMixingA: realism.a,
		terrainMixingB: realism.b,
		terrainMixingC: realism.c,
		textureLayers: [...surfaceMix.layers],
		texturePolicy: terrainTexturePolicy(recipe, realism, surfaceMix),
		textureUrl: null,
		transparent: false,
		visible: true
	};
}

function terrainTexturePolicy(recipe, realism, surfaceMix) {
	return {
		baseSource: 'procedural-gpu-earth-with-bounded-real-layers',
		fullResolutionEcologicalLayers: true,
		hydration: 'shared-cache-bounded-ecological-page',
		layerCount: surfaceMix.layers.length,
		logicalLayerCount: recipe.logicalLayerCount,
		macroMixing: Object.freeze({
			a: realism.a,
			b: realism.b,
			c: realism.c
		}),
		materialStackDiagnostics: materialStackDiagnostics(recipe.stack, 10),
		mix: 'zone-slope-height-wetness-plus-shared-real-layers',
		nativeTexelDensity: true,
		proceduralEarth: true,
		realBaseImage: false,
		realMixImage: false,
		repeatMode: 'per-layer-ecological-repeat',
		selectedRoles: surfaceMix.stats.selectedRoles,
		shader: recipe.shader,
		texelsPerWorld: 0,
		textureUrl: null,
		uvUnitsPerWorld: TERRAIN_UV_UNITS_PER_WORLD
	};
}
