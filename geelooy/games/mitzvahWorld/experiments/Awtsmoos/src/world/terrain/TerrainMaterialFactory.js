// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file TerrainMaterialFactory.js
 * @description Creates a bright asynchronously hydrated alpine terrain material.
 * The Awtsmoos renews meadow, mud, moss, stone, and riverbank in every visible instant;
 * Awtsmoos.com keeps the waiting valley luminous while original source pixels arrive.
 */

import { MeshStandardMaterial } from '../../../../light-three-gltf/tiny-runtime.js';
import { cachedTextureImage } from '../../assets/PublicMaterialCache.js';
import { REPEAT_HOOKS, terrainRepeat, textureSize } from '../../assets/TextureRepeat.js';
import { materialStackDiagnostics } from '../materials/MaterialStackRecipe.js';
import { terrainLayerRecipe } from './TerrainLayerRecipe.js';

const TERRAIN_SOURCE_TINT = Object.freeze([0.94, 0.98, 0.90, 1]);
const TERRAIN_UV_UNITS_PER_WORLD = Object.freeze([0.035, 0.035]);

/**
 * Creates the canonical terrain material before or after source-image hydration.
 * The neutral physical tint is intentionally independent of current image readiness,
 * because residency fills mapImage later without rebuilding the material color.
 * @param {object} options Terrain texture, quality, and world-size inputs.
 * @returns {MeshStandardMaterial} A source-preserving layered material.
 */
export function createTerrainMaterial(options) {
	const recipe = terrainLayerRecipe(options.quality);
	const textureUrl = options.grassImage?.src || options.fallbackUrl || recipe.baseUrl;
	const material = new MeshStandardMaterial({
		color: TERRAIN_SOURCE_TINT,
		metalness: 0,
		name: 'Awtsmoos_canonical_alpine_valley_material',
		roughness: 0.96
	});
	Object.assign(material, {
		anisotropy: 8,
		mapImage: options.grassImage,
		mapRepeat: terrainRepeat(options.size, options.grassImage),
		materialStack: recipe.stack,
		mixImage: options.dirtImage,
		mixPatchScale: 0.017,
		mixPatchSharpness: 0.62,
		mixRepeat: terrainRepeat(options.size, options.dirtImage),
		mixStrength: 0.64,
		mixTextureUrl: recipe.dirtUrl,
		textureLayers: recipe.layers.map(hydratableLayer),
		texturePolicy: terrainTexturePolicy(recipe, options.grassImage, textureUrl),
		textureUrl
	});
	return material;
}

function hydratableLayer(layer) {
	return {
		...layer,
		image: cachedTextureImage(layer.url)
	};
}

function terrainTexturePolicy(recipe, grassImage, textureUrl) {
	return {
		baseSource: 'canonical-original-pixels-with-neutral-physical-tint',
		fullResolutionEcologicalLayers: true,
		hydration: grassImage ? 'ready-at-construction' : 'deferred-residency',
		layerCount: recipe.layers.length,
		logicalLayerCount: recipe.logicalLayerCount,
		materialStackDiagnostics: materialStackDiagnostics(recipe.stack, 10),
		mix: 'normalized-zone-slope-height-wetness-world-space',
		nativeTexelDensity: true,
		publicFirebase: true,
		repeatMode: 'fractional-mirror-original-pixel-density',
		shader: recipe.shader,
		sourcePixels: textureSize(grassImage),
		texelsPerWorld: REPEAT_HOOKS.terrainTexelsPerWorld,
		textureUrl,
		uvUnitsPerWorld: TERRAIN_UV_UNITS_PER_WORLD
	};
}
