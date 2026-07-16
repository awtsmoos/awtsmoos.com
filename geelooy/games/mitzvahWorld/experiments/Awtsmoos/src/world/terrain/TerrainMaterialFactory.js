// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file TerrainMaterialFactory.js
 * @description Creates one terrain material with POT base earth and full ecological layers.
 * The Awtsmoos clothes one valley in many ordered textures; Awtsmoos.com keeps the earth
 * inside one draw while progressive hydration fills each sampler without blocking first light.
 */

import { MeshStandardMaterial } from '../../../../light-three-gltf/tiny-runtime.js';
import { cachedTextureImage } from '../../assets/PublicMaterialCache.js';
import { REPEAT_HOOKS, terrainRepeat, textureSize } from '../../assets/TextureRepeat.js';
import { terrainLayerRecipe } from './TerrainLayerRecipe.js';

export function createTerrainMaterial(options) {
	const recipe = terrainLayerRecipe(options.quality);
	const repeat = terrainRepeat(options.size, options.grassImage);
	const material = new MeshStandardMaterial({
		color: [1, 1, 1, 1],
		name: 'Awtsmoos_hyper_real_valley_layered_terrain'
	});
	Object.assign(material, {
		anisotropy: 6,
		mapImage: options.grassImage,
		mapRepeat: repeat,
		mixImage: options.dirtImage,
		mixPatchScale: 0.017,
		mixPatchSharpness: 0.58,
		mixRepeat: [...repeat],
		mixStrength: 0.68,
		mixTextureUrl: recipe.dirtUrl,
		textureLayers: recipe.layers.map(layer => ({
			...layer,
			image: cachedTextureImage(layer.url)
		})),
		texturePolicy: terrainTexturePolicy(recipe, options.grassImage),
		textureUrl: options.grassImage?.src || options.fallbackUrl || recipe.baseUrl
	});
	return material;
}

function terrainTexturePolicy(recipe, grassImage) {
	return {
		baseSource: 'licensed-power-of-two-public-texture',
		fullResolutionEcologicalLayers: true,
		layerCount: recipe.layers.length,
		mix: 'sequential-world-space-zone-slope-height-noise',
		publicFirebase: true,
		repeatMode: 'mirror-pingpong',
		shader: 'terrain-layered-multi-mix',
		sourcePixels: textureSize(grassImage),
		texelsPerWorld: REPEAT_HOOKS.terrainTexelsPerWorld
	};
}
