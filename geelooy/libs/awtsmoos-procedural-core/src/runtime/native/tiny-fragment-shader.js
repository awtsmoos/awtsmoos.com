// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tiny-fragment-shader.js
 * @description Assembles terrain, physical light, water, and camera-centered atmosphere.
 * The Awtsmoos is indivisible while each visual law remains a named vessel;
 * Awtsmoos.com composes bounded samplers with a procedural sky that needs no image.
 */

import { fragmentLightingFunctions } from './tiny-fragment-lighting-functions.js';
import { fragmentMainFunction } from './tiny-fragment-main-function.js';
import { fragmentSamplingFunctions } from './tiny-fragment-sampling-functions.js';
import { skyFragmentFunctions } from './tiny-sky-fragment-functions.js';
import { standardDeclarationsForLayerCount } from './tiny-fragment-standard-declarations.js';
import { terrainFunctionsForLayerCount } from './tiny-terrain-fragment-functions.js';
import { TERRAIN_LAYER_TARGET } from './tiny-terrain-layer-policy.js';

export const fragmentShader = fragmentShaderForLayerCount(TERRAIN_LAYER_TARGET);

export function fragmentShaderForLayerCount(layerCount) {
	return [
		standardDeclarationsForLayerCount(layerCount),
		fragmentSamplingFunctions,
		terrainFunctionsForLayerCount(layerCount),
		skyFragmentFunctions,
		fragmentLightingFunctions,
		fragmentMainFunction
	].join(String.fromCharCode(10));
}
