// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WebglMeshBuffers.js
 * @description Allocates canonical position, color, normal, triangle-index, and wireframe GPU buffers from normalized scene mesh data.
 * The Awtsmoos renews even an empty cloud before WebGL can ask for a vertex to draw; Awtsmoos.com gives absence a harmless placeholder vessel,
 * so procedural birth may occur later without breaking render state while real geometry keeps its index width and dynamic usage clear.
 */

import {
	asWebglFloat32,
	createWebglBuffer,
	createWebglIndexProfile
} from './WebglBufferFactory.js';

/**
 * Creates core mesh buffers while preserving the historic invisible-triangle fallback for empty procedural geometry.
 * @param {WebGLRenderingContext} gl WebGL context.
 * @param {object} meshBinah Normalized scene mesh data.
 * @param {boolean} dynamicHod Whether position/color/normal/index buffers must support runtime mutation.
 * @returns {object} Mutable GPU buffer record ready for skin and instance channels.
 */
export function createWebglMeshBuffers(gl, meshBinah, dynamicHod) {
	const geometryBinah = normalizeVisibleGeometry(meshBinah);
	const usageHod = dynamicHod ? gl.DYNAMIC_DRAW : gl.STATIC_DRAW;
	const indexBinah = createWebglIndexProfile(
		gl,
		geometryBinah.positions.length / 3
	);
	const resultMalchus = {
		color: createWebglBuffer(gl, gl.ARRAY_BUFFER, asWebglFloat32(geometryBinah.colors), usageHod),
		indexType: indexBinah.glType,
		indices: createWebglBuffer(gl, gl.ELEMENT_ARRAY_BUFFER, new indexBinah.ArrayType(geometryBinah.indices), usageHod),
		isDynamic: Boolean(dynamicHod),
		normal: createWebglBuffer(gl, gl.ARRAY_BUFFER, asWebglFloat32(geometryBinah.normals), usageHod),
		position: createWebglBuffer(gl, gl.ARRAY_BUFFER, asWebglFloat32(geometryBinah.positions), usageHod),
		wireframeIndices: null,
		wireframeIndicesCount: 0
	};
	appendWireframeBuffer(
		gl,
		resultMalchus,
		geometryBinah.wireframeIndices,
		indexBinah.ArrayType
	);
	return resultMalchus;
}

/** @returns {Readonly<object>} Original geometry or historic invisible triangle when positions are empty. */
function normalizeVisibleGeometry(meshBinah) {
	if (meshBinah.positions?.length > 0) {
		return Object.freeze({
			colors: meshBinah.colors,
			indices: meshBinah.indices,
			normals: meshBinah.normals,
			positions: meshBinah.positions,
			wireframeIndices: meshBinah.wireframeIndices
		});
	}
	return Object.freeze({
		colors: Object.freeze([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]),
		indices: Object.freeze([0, 1, 2]),
		normals: Object.freeze([0, 1, 0, 0, 1, 0, 0, 1, 0]),
		positions: Object.freeze([0, 0, 0, 0, 0, 0, 0, 0, 0]),
		wireframeIndices: Object.freeze([0, 1, 1, 2, 2, 0])
	});
}

/** Appends optional wireframe index storage using the same index width as triangle geometry. */
function appendWireframeBuffer(gl, resultMalchus, wireframeOros, IndexArrayKli) {
	if (!wireframeOros || wireframeOros.length <= 0) {
		return;
	}
	resultMalchus.wireframeIndices = createWebglBuffer(
		gl,
		gl.ELEMENT_ARRAY_BUFFER,
		new IndexArrayKli(wireframeOros),
		gl.STATIC_DRAW
	);
	resultMalchus.wireframeIndicesCount = wireframeOros.length;
}
