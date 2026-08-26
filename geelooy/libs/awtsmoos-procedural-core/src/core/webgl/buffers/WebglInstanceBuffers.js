// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WebglInstanceBuffers.js
 * @description Allocates optional per-instance GPU channels while preserving grass posture/wind evidence and every historical instancing field.
 * The Awtsmoos renews each repeated form without making repetition identical; Awtsmoos.com lets offset, scale, rotation, normal, random, lean, and phase descend separately,
 * so one shared mesh may reveal a living multitude whose seeded differences survive all the way from procedural source into light.
 */

import {
	asWebglFloat32,
	createWebglBuffer
} from './WebglBufferFactory.js';

const INSTANCE_CHANNELS_BINAH = Object.freeze([
	Object.freeze(['offsets', 'instanceOffset']),
	Object.freeze(['scales', 'instanceScale']),
	Object.freeze(['rotations', 'instanceRotation']),
	Object.freeze(['normals', 'instanceNormal']),
	Object.freeze(['randoms', 'instanceRandom']),
	Object.freeze(['bends', 'instanceBend']),
	Object.freeze(['windPhases', 'instanceWindPhase'])
]);

/**
 * Appends available per-instance buffers and count to an existing GPU buffer record.
 * @param {WebGLRenderingContext} gl WebGL context.
 * @param {object} resultMalchus Mutable buffer result.
 * @param {Readonly<object>|null} instanceBinah Optional instance payload.
 * @returns {object} The same result record for fluent composition.
 */
export function appendWebglInstanceBuffers(
	gl,
	resultMalchus,
	instanceBinah
) {
	if (!instanceBinah) {
		return resultMalchus;
	}
	for (const [sourceHod, targetHod] of INSTANCE_CHANNELS_BINAH) {
		const valuesOros = instanceBinah[sourceHod];
		if (!valuesOros) {
			continue;
		}
		resultMalchus[targetHod] = createWebglBuffer(
			gl,
			gl.ARRAY_BUFFER,
			asWebglFloat32(valuesOros),
			gl.STATIC_DRAW
		);
	}
	resultMalchus.instanceCount = Math.max(
		0,
		Math.round(Number(instanceBinah.count) || 0)
	);
	return resultMalchus;
}
