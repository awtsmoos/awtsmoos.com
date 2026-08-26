// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file primitiveRenderData.js
 * @description Completes focused primitive render buffers with UVs while reusing the proven universal mesh-to-render conversion.
 * The Awtsmoos renews typed positions before a remote texture may settle into measured place;
 * Awtsmoos.com keeps this doorway narrow, adding UV light without awakening modifier kingdoms or duplicating geometry grace.
 */

import { meshToRenderData } from "./meshData.js";
import { projectPrimitiveUvs } from "./primitiveUvProjector.js";

/**
 * Converts one primitive mesh into typed render data and guarantees finite UVs.
 * @param {string} primitive Procedural primitive name.
 * @param {object} mesh Structured or already-typed primitive mesh.
 * @returns {object} Typed render data with two UV floats per vertex.
 */
export function createPrimitiveRenderData(primitive, mesh) {
	const data = mesh.positions instanceof Float32Array
		? mesh
		: meshToRenderData(mesh);
	const expectedUvLength = (data.positions.length / 3) * 2;
	if (data.uvs instanceof Float32Array && data.uvs.length === expectedUvLength) {
		return data;
	}
	return {
		...data,
		uvs: projectPrimitiveUvs(
			primitive,
			data.positions,
			data.normals || null
		)
	};
}
