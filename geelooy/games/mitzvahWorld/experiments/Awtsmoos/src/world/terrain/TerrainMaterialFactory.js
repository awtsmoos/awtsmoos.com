// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file TerrainMaterialFactory.js
 * @description Creates one alpine terrain material whose original pixels keep physical scale.
 * The Awtsmoos clothes one continuous earth through many untouched source images; Awtsmoos.com
 * resolves each hydrated layer against measured world UVs instead of stretching it over the valley.
 */

import { MeshStandardMaterial } from '../../../../light-three-gltf/tiny-runtime.js';
import { cachedTextureImage } from '../../assets/PublicMaterialCache.js';
import { REPEAT_HOOKS, terrainRepeat, textureSize } from '../../assets/TextureRepeat.js';
import { materialStackDiagnostics } from '../materials/MaterialStackRecipe.js';
import { terrainLayerRecipe } from './TerrainLayerRecipe.js';

const ALPINE_FALLBACK_COLOR = Object.freeze([0.25, 0.31, 0.14, 1]);
const TERRAIN_UV_UNITS_PER_WORLD = Object.freeze([0.035, 0.035]);

export function createTerrainMaterial(options) {
	const recipe = terrainLayerRecipe(options.quality);
	const material = new MeshStandardMaterial({
		color: ALPINE_FALLBACK_COLOR,
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
		texturePolicy: terrainTexturePolicy(recipe, options.grassImage),
		textureUrl: options.grassImage?.src || options.fallbackUrl || recipe.baseUrl
	});
	return material;
}

function hydratableLayer(layer) {
	return {
		...layer,
		image: cachedTextureImage(layer.url)
	};
}

function terrainTexturePolicy(recipe, grassImage) {
	return {
		baseSource: 'canonical-original-pixels-with-authored-olive-fallback',
		fullResolutionEcologicalLayers: true,
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
		uvUnitsPerWorld: TERRAIN_UV_UNITS_PER_WORLD
	};
}
