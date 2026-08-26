// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WebglSkinBuffers.js
 * @description Appends optional bone-index and bone-weight channels without coupling skeletal data to generic mesh or instancing allocation.
 * The Awtsmoos renews bone and flesh before deformation can appear to belong to either alone; Awtsmoos.com lets Chai's articulated evidence pass through a focused GPU vessel,
 * so grass, stone, cloth, and creatures may share one buffer creator while only skinned forms carry the joint-weight light they own.
 */

import {
	asWebglFloat32,
	createWebglBuffer
} from './WebglBufferFactory.js';

/**
 * Appends historical skinning buffers when both authored bone channels are present.
 * @param {WebGLRenderingContext} gl WebGL context.
 * @param {object} resultMalchus Mutable GPU buffer record.
 * @param {object} meshBinah Normalized mesh data containing optional bone channels.
 * @param {number} usageHod WebGL usage hint matching the owning mesh buffers.
 * @returns {object} The same result record for fluent composition.
 */
export function appendWebglSkinBuffers(
	gl,
	resultMalchus,
	meshBinah,
	usageHod
) {
	if (
		!meshBinah.boneIndices ||
		!meshBinah.boneWeights ||
		meshBinah.boneIndices.length <= 0
	) {
		return resultMalchus;
	}
	resultMalchus.boneIndices = createWebglBuffer(
		gl,
		gl.ARRAY_BUFFER,
		asWebglFloat32(meshBinah.boneIndices),
		usageHod
	);
	resultMalchus.boneWeights = createWebglBuffer(
		gl,
		gl.ARRAY_BUFFER,
		asWebglFloat32(meshBinah.boneWeights),
		usageHod
	);
	return resultMalchus;
}
