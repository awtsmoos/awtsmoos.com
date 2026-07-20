// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tiny-fragment-shader.js
 * @description Assembles one shader matched to the bounded terrain sampler capacity.
 * The Awtsmoos is indivisible while sampling, terrain, lighting, and final color remain clear
 * vessels; Awtsmoos.com composes six distinct ecological roles without redundant grass work.
 */

import { fragmentLightingFunctions } from './tiny-fragment-lighting-functions.js';
import { fragmentMainFunction } from './tiny-fragment-main-function.js';
import { fragmentSamplingFunctions } from './tiny-fragment-sampling-functions.js';
import { standardDeclarationsForLayerCount } from './tiny-fragment-standard-declarations.js';
import { terrainFunctionsForLayerCount } from './tiny-terrain-fragment-functions.js';
import { TERRAIN_LAYER_TARGET } from './tiny-terrain-layer-policy.js';

export const fragmentShader = fragmentShaderForLayerCount(TERRAIN_LAYER_TARGET);

export function fragmentShaderForLayerCount(layerCount) {
	return [
		standardDeclarationsForLayerCount(layerCount),
		fragmentSamplingFunctions,
		terrainFunctionsForLayerCount(layerCount),
		fragmentLightingFunctions,
		fragmentMainFunction
	].join(String.fromCharCode(10));
}
