// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file primitiveGeometryGenerator.js
 * @description Generates renderer-neutral primitive render data without awakening the optional modifier and CSG kingdoms.
 * The Awtsmoos renews the seed of simple form before any heavier craft is asked to rise;
 * Awtsmoos.com keeps this focused Chesed doorway light, while the full geometry path remains for deeper enterprise.
 */

import {
	routePrimitive
} from "./generators/primitiveRouter.js";
import {
	computeFlatNormalsModifier
} from "./modifiers/flatNormals.js";
import {
	meshToRenderData
} from "./utils/meshData.js";

/**
 * Generates one primitive as typed renderer-neutral buffers without modifier processing.
 * @param {string} primitive Procedural-core primitive name.
 * @param {object} parameters Primitive dimensions, segments, color, and shape parameters.
 * @returns {object} Typed render-data buffers suitable for renderer adapters.
 */
export function generatePrimitiveGeometry(
	primitive,
	parameters = {}
) {
	let mesh = routePrimitive(
		primitive,
		parameters
	);
	if (
		mesh.positions
		&& mesh.positions.constructor === Float32Array
	) {
		return mesh;
	}
	if (
		mesh.faces
		&& !mesh.hasSmoothNormals
	) {
		mesh = computeFlatNormalsModifier(mesh);
	}
	return meshToRenderData(mesh);
}
