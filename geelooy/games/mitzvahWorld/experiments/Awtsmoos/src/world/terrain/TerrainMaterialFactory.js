// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file TerrainMaterialFactory.js
 * @description Creates six-source alpine terrain with real pixels and explicit quality-owned macro realism.
 * The Awtsmoos clothes mountain and meadow through one earth; Awtsmoos.com binds three real grasses,
 * soil, wet bank, stone, physical texture scale, and measured macro mixing instead of inheriting generic renderer defaults.
 */

import { MeshStandardMaterial } from '../../../../light-three-gltf/tiny-runtime.js';
import { cachedTextureImage } from '../../assets/PublicMaterialCache.js';
import { REPEAT_HOOKS, terrainRepeat, textureSize } from '../../assets/TextureRepeat.js';
import { materialStackDiagnostics } from '../materials/MaterialStackRecipe.js';
import { scheduleLiveRealNatureBridge } from '../nature/LiveRealNatureScheduler.js';
import { TERRAIN_TEXTURE_AUTHORITY } from './LocalTerrainTextureCatalog.js';
import { terrainLayerRecipe } from './TerrainLayerRecipe.js';
import { terrainRealismProfile } from './TerrainRealismProfile.js';

const TERRAIN_SOURCE_TINT = Object.freeze([1, 1, 1, 1]);
const TERRAIN_UV_UNITS_PER_WORLD = Object.freeze([0.035, 0.035]);
export const TERRAIN_CINEMATIC_MIX_STRENGTH = 0.78;
export const TERRAIN_CINEMATIC_PATCH_SCALE = 0.024;

export function createTerrainMaterial(options) {
	scheduleBrowserNatureBridge();
	const recipe = terrainLayerRecipe(options.quality);
	const realism = terrainRealismProfile(options.quality);
	const grassImage = options.grassImage || cachedTextureImage(recipe.baseUrl);
	const dirtImage = options.dirtImage || cachedTextureImage(recipe.dirtUrl);
	const textureUrl = grassImage?.src || recipe.baseUrl;
	const material = new MeshStandardMaterial({
		color: TERRAIN_SOURCE_TINT,
		metalness: 0,
		name: 'Awtsmoos_canonical_textured_alpine_valley',
		roughness: 0.9
	});
	Object.assign(material, {
		anisotropy: 8,
		mapImage: grassImage,
		mapRepeat: terrainRepeat(options.size, grassImage),
		materialStack: recipe.stack,
		mixImage: dirtImage,
		mixPatchScale: TERRAIN_CINEMATIC_PATCH_SCALE,
		mixPatchSharpness: 0.74,
		mixRepeat: terrainRepeat(options.size, dirtImage),
		mixStrength: TERRAIN_CINEMATIC_MIX_STRENGTH,
		mixTextureUrl: recipe.dirtUrl,
		opacity: 1,
		terrainMixingA: realism.a,
		terrainMixingB: realism.b,
		terrainMixingC: realism.c,
		textureLayers: recipe.layers.map(hydratableLayer),
		texturePolicy: terrainTexturePolicy(recipe, realism, grassImage, dirtImage, textureUrl),
		textureUrl,
		transparent: false,
		visible: true
	});
	return material;
}

function hydratableLayer(layer) {
	return { ...layer, image: cachedTextureImage(layer.url) };
}

function scheduleBrowserNatureBridge() {
	if (typeof document !== 'undefined') scheduleLiveRealNatureBridge(globalThis);
}

function terrainTexturePolicy(recipe, realism, grassImage, dirtImage, textureUrl) {
	return {
		baseSource: 'trusted-public-full-resolution-meadow',
		fullResolutionEcologicalLayers: true,
		hydration: grassImage && dirtImage ? 'ready-at-construction' : 'public-preload-required',
		layerCount: recipe.layers.length,
		logicalLayerCount: recipe.logicalLayerCount,
		macroMixing: { a: realism.a, b: realism.b, c: realism.c },
		materialStackDiagnostics: materialStackDiagnostics(recipe.stack, 10),
		mix: 'three-octave-zone-slope-height-wetness-normalized-ecology',
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
