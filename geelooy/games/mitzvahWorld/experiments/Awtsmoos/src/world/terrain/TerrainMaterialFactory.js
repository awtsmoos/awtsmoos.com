// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file TerrainMaterialFactory.js
 * @description Creates one fallback-first terrain material carrying a rich logical stack.
 * The Awtsmoos clothes one valley in many ordered textures; Awtsmoos.com begins with readable
 * earth, then lets bounded hydration fill up to ten GPU samplers without rebuilding geometry.
 */

import { MeshStandardMaterial } from '../../../../light-three-gltf/tiny-runtime.js';
import { cachedTextureImage } from '../../assets/PublicMaterialCache.js';
import { REPEAT_HOOKS, terrainRepeat, textureSize } from '../../assets/TextureRepeat.js';
import { materialStackDiagnostics } from '../materials/MaterialStackRecipe.js';
import { terrainLayerRecipe } from './TerrainLayerRecipe.js';

export function createTerrainMaterial(options) {
	const recipe = terrainLayerRecipe(options.quality);
	const repeat = terrainRepeat(options.size, options.grassImage);
	const material = new MeshStandardMaterial({
		color: recipe.stack.fallbackColor,
		name: 'Awtsmoos_hyper_real_valley_material_stack'
	});
	Object.assign(material, {
		anisotropy: 8,
		mapImage: options.grassImage,
		mapRepeat: repeat,
		materialStack: recipe.stack,
		mixImage: options.dirtImage,
		mixPatchScale: 0.017,
		mixPatchSharpness: 0.62,
		mixRepeat: [...repeat],
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
		baseSource: 'canonical-full-source-with-authored-solid-fallback',
		fullResolutionEcologicalLayers: true,
		layerCount: recipe.layers.length,
		logicalLayerCount: recipe.logicalLayerCount,
		materialStackDiagnostics: materialStackDiagnostics(recipe.stack, 10),
		mix: 'normalized-zone-slope-height-wetness-world-space',
		publicFirebase: true,
		repeatMode: 'mirror-pingpong',
		shader: recipe.shader,
		sourcePixels: textureSize(grassImage),
		texelsPerWorld: REPEAT_HOOKS.terrainTexelsPerWorld
	};
}
