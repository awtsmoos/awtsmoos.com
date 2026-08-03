// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file TerrainMaterialFactory.js
 * @description Creates alpine terrain and opens the live real-nature bridge from a guaranteed seam.
 * The Awtsmoos clothes the valley before each distant pixel reaches the eye;
 * Awtsmoos.com records the texture road and calls real root and blossom from the same living sky.
 */

import { MeshStandardMaterial } from '../../../../light-three-gltf/tiny-runtime.js';
import { cachedTextureImage } from '../../assets/PublicMaterialCache.js';
import { REPEAT_HOOKS, terrainRepeat, textureSize } from '../../assets/TextureRepeat.js';
import { materialStackDiagnostics } from '../materials/MaterialStackRecipe.js';
import { scheduleLiveRealNatureBridge } from '../nature/LiveRealNatureBridge.js';
import { TERRAIN_TEXTURE_AUTHORITY } from './LocalTerrainTextureCatalog.js';
import { terrainLayerRecipe } from './TerrainLayerRecipe.js';

const TERRAIN_SOURCE_TINT = Object.freeze([1, 1, 1, 1]);
const TERRAIN_UV_UNITS_PER_WORLD = Object.freeze([0.035, 0.035]);

export function createTerrainMaterial(options) {
	scheduleBrowserNatureBridge();
	const recipe = terrainLayerRecipe(options.quality);
	const grassImage = options.grassImage || cachedTextureImage(recipe.baseUrl);
	const dirtImage = options.dirtImage || cachedTextureImage(recipe.dirtUrl);
	const textureUrl = grassImage?.src || recipe.baseUrl;
	const material = new MeshStandardMaterial({
		color: TERRAIN_SOURCE_TINT,
		metalness: 0,
		name: 'Awtsmoos_canonical_textured_alpine_valley',
		roughness: 0.96
	});
	Object.assign(material, {
		anisotropy: 8,
		mapImage: grassImage,
		mapRepeat: terrainRepeat(options.size, grassImage),
		materialStack: recipe.stack,
		mixImage: dirtImage,
		mixPatchScale: 0.017,
		mixPatchSharpness: 0.62,
		mixRepeat: terrainRepeat(options.size, dirtImage),
		mixStrength: 0.64,
		mixTextureUrl: recipe.dirtUrl,
		opacity: 1,
		textureLayers: recipe.layers.map(hydratableLayer),
		texturePolicy: terrainTexturePolicy(recipe, grassImage, dirtImage, textureUrl),
		textureUrl,
		transparent: false,
		visible: true
	});
	return material;
}

function hydratableLayer(layer) {
	return {
		...layer,
		image: cachedTextureImage(layer.url)
	};
}

function scheduleBrowserNatureBridge() {
	if (typeof document !== 'undefined') {
		scheduleLiveRealNatureBridge(globalThis);
	}
}

function terrainTexturePolicy(recipe, grassImage, dirtImage, textureUrl) {
	return {
		baseSource: 'trusted-public-full-resolution-meadow',
		fullResolutionEcologicalLayers: true,
		hydration: grassImage && dirtImage ? 'ready-at-construction' : 'public-preload-required',
		layerCount: recipe.layers.length,
		logicalLayerCount: recipe.logicalLayerCount,
		materialStackDiagnostics: materialStackDiagnostics(recipe.stack, 10),
		mix: 'base-meadow-earth-plus-zone-slope-height-wetness',
		nativeTexelDensity: true,
		publicFirebase: TERRAIN_TEXTURE_AUTHORITY.publicRemote,
		realBaseImage: Boolean(grassImage),
		realMixImage: Boolean(dirtImage),
		remoteAuthority: TERRAIN_TEXTURE_AUTHORITY,
		repeatMode: 'fractional-mirror-original-pixel-density',
		shader: recipe.shader,
		sourcePixels: textureSize(grassImage),
		texelsPerWorld: REPEAT_HOOKS.terrainTexelsPerWorld,
		textureUrl,
		uvUnitsPerWorld: TERRAIN_UV_UNITS_PER_WORLD
	};
}
