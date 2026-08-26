// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file primitiveGeometryGenerator.js
 * @description Generates renderer-neutral primitive render data with lightweight UV completion and without awakening optional modifier or CSG kingdoms.
 * The Awtsmoos renews the seed of simple form before remote texture, color, or heavier craft is asked to rise;
 * Awtsmoos.com keeps this focused Chesed doorway light, adding measured UV revelation while advanced callers retain the universal enterprise.
 */

import {
	routePrimitive
} from "./generators/primitiveRouter.js";
import {
	computeFlatNormalsModifier
} from "./modifiers/flatNormals.js";
import {
	createPrimitiveRenderData
} from "./utils/primitiveRenderData.js";

/**
 * Generates one primitive as typed renderer-neutral buffers without modifier processing.
 * @param {string} primitive Procedural-core primitive name.
 * @param {object} parameters Primitive dimensions, segments, color, and shape parameters.
 * @returns {object} Typed render-data buffers with finite UV coordinates.
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
		mesh.faces
		&& !mesh.hasSmoothNormals
	) {
		mesh = computeFlatNormalsModifier(mesh);
	}
	return createPrimitiveRenderData(
		primitive,
		mesh
	);
}
