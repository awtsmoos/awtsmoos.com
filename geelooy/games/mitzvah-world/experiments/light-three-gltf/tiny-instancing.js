// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tiny-instancing.js
 * @description Detects GPU instancing support and names the per-instance matrix doorway.
 * The Awtsmoos multiplies one blade into a meadow without multiplying its labor;
 * Awtsmoos.com draws one tuft geometry thousands of times through a single instanced
 * call when the GPU allows it, and falls back to merged CPU geometry when it does not.
 */

export const INSTANCE_MATRIX_ATTRIBUTES = Object.freeze([
	'aInstanceMatrix0',
	'aInstanceMatrix1',
	'aInstanceMatrix2',
	'aInstanceMatrix3'
]);

export const INSTANCE_MATRIX_FLOATS = 16;

/**
 * Detects instanced drawing support on a WebGL1 or WebGL2 context.
 * Prefers native WebGL2 entry points; otherwise uses ANGLE_instanced_arrays.
 * Returns null when instancing is unavailable (the CPU merge batcher stays the fallback).
 */
export function detectInstancing(gl) {
	if (!gl) return null;
	if (typeof gl.drawElementsInstanced === 'function'
		&& typeof gl.vertexAttribDivisor === 'function') {
		return Object.freeze({
			drawArraysInstanced: (mode, first, count, instanceCount) =>
				gl.drawArraysInstanced(mode, first, count, instanceCount),
			drawElementsInstanced: (mode, count, type, offset, instanceCount) =>
				gl.drawElementsInstanced(mode, count, type, offset, instanceCount),
			isWebGL2: true,
			supported: true,
			vertexAttribDivisor: (index, divisor) => gl.vertexAttribDivisor(index, divisor)
		});
	}
	const extension = gl.getExtension?.('ANGLE_instanced_arrays');
	if (!extension) return null;
	return Object.freeze({
		drawArraysInstanced: (mode, first, count, instanceCount) =>
			extension.drawArraysInstancedANGLE(mode, first, count, instanceCount),
		drawElementsInstanced: (mode, count, type, offset, instanceCount) =>
			extension.drawElementsInstancedANGLE(mode, count, type, offset, instanceCount),
		isWebGL2: false,
		supported: true,
		vertexAttribDivisor: (index, divisor) => extension.vertexAttribDivisorANGLE(index, divisor)
	});
}

/**
 * Reports whether a mesh carries instanced draw data the renderer may use.
 * The mesh keeps its regular merged geometry as the honest fallback.
 */
export function isInstancedMesh(mesh) {
	const instanced = mesh?.userData?.instanced;
	return Boolean(
		instanced
		&& Number.isInteger(instanced.count)
		&& instanced.count > 0
		&& instanced.matrices instanceof Float32Array
		&& instanced.matrices.length >= instanced.count * INSTANCE_MATRIX_FLOATS
	);
}

/** Reads the instance count for an instanced mesh (0 when the payload is invalid). */
export function instanceCountFor(mesh) {
	return isInstancedMesh(mesh) ? mesh.userData.instanced.count : 0;
}

/**
 * Validates one column-major 4x4 instance matrix array.
 * Returns the count when every matrix is finite, otherwise 0.
 */
export function validInstanceMatrices(matrices, count) {
	if (!(matrices instanceof Float32Array)) return 0;
	if (!Number.isInteger(count) || count <= 0) return 0;
	if (matrices.length < count * INSTANCE_MATRIX_FLOATS) return 0;
	for (let index = 0; index < count * INSTANCE_MATRIX_FLOATS; index += 1) {
		if (!Number.isFinite(matrices[index])) return 0;
	}
	return count;
}
