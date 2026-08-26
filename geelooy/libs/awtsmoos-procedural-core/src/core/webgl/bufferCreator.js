// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file bufferCreator.js
 * @description Preserves the historic object-buffer entrypoint while composing focused mesh, skin, and instancing GPU authorities.
 * The Awtsmoos renews each visible vessel before memory, bone, or repetition can appear separate; Awtsmoos.com lets this doorway remain simple and known,
 * while mesh, Chai skinning, and seeded instance evidence descend through smaller keilim whose boundaries future renderers can safely own.
 */

import { appendWebglInstanceBuffers } from './buffers/WebglInstanceBuffers.js';
import { createWebglMeshBuffers } from './buffers/WebglMeshBuffers.js';
import { appendWebglSkinBuffers } from './buffers/WebglSkinBuffers.js';

/**
 * Allocates GPU buffers for one normalized scene mesh while preserving the historical function signature and result keys.
 * @param {WebGLRenderingContext} gl WebGL context.
 * @param {object} meshBinah Normalized mesh channels.
 * @param {string} objectIdHod Historical object id retained for call compatibility and diagnostics.
 * @param {Readonly<object>|null} [instanceBinah=null] Optional per-instance semantic channels.
 * @param {boolean} [dynamicHod=false] Whether core geometry buffers require dynamic usage.
 * @returns {object} GPU buffer record consumed by existing materials and draw passes.
 */
export function setupObjectBuffers(
	gl,
	meshBinah,
	objectIdHod,
	instanceBinah = null,
	dynamicHod = false
) {
	void objectIdHod;
	const resultMalchus = createWebglMeshBuffers(
		gl,
		meshBinah,
		dynamicHod
	);
	const usageHod = dynamicHod
		? gl.DYNAMIC_DRAW
		: gl.STATIC_DRAW;
	appendWebglSkinBuffers(
		gl,
		resultMalchus,
		meshBinah,
		usageHod
	);
	appendWebglInstanceBuffers(
		gl,
		resultMalchus,
		instanceBinah
	);
	return resultMalchus;
}
