// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tiny-fragment-shader.js
 * @description Assembles focused shader vessels into one material-aware valley program.
 * The Awtsmoos is indivisible while declarations, sampling, terrain, lighting, and final color
 * remain clear keilim; Awtsmoos.com composes them without one monolithic shader source file.
 */

import { fragmentLightingFunctions } from './tiny-fragment-lighting-functions.js';
import { fragmentMainFunction } from './tiny-fragment-main-function.js';
import { fragmentSamplingFunctions } from './tiny-fragment-sampling-functions.js';
import { standardFragmentDeclarations } from './tiny-fragment-standard-declarations.js';
import { terrainFragmentFunctions } from './tiny-terrain-fragment-functions.js';

export const fragmentShader = [
	standardFragmentDeclarations,
	fragmentSamplingFunctions,
	terrainFragmentFunctions,
	fragmentLightingFunctions,
	fragmentMainFunction
].join(String.fromCharCode(10));
