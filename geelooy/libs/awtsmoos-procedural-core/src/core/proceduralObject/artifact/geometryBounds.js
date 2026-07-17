// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos renews every attribute, index, object, and world from nothing
 * at every instant. This Awtsmoos.com vessel keeps one responsibility bounded
 * so limitless procedural form remains inspectable, deterministic, and safe.
 */

import {
	getGeometryVertexCount
} from "./createGeometryArtifact.js";

/**
 * Calculates axis-aligned bounds from a position attribute of any item size.
 *
 * @param {object} geometry Geometry artifact.
 * @returns {object|null} Minimum, maximum, center, and size.
 */
export function calculateGeometryBounds(geometry) {
	const position = geometry.attributes?.position;
	const count = getGeometryVertexCount(geometry);
	if (!position || count === 0) {
		return null;
	}
	const minimum = [Infinity, Infinity, Infinity];
	const maximum = [-Infinity, -Infinity, -Infinity];

	for (let index = 0; index < count; index += 1) {
		for (let axis = 0; axis < 3; axis += 1) {
			const value = position.array[index * position.itemSize + axis] ?? 0;
			minimum[axis] = Math.min(minimum[axis], value);
			maximum[axis] = Math.max(maximum[axis], value);
		}
	}
	const size = maximum.map((value, axis) => value - minimum[axis]);
	const center = maximum.map((value, axis) => (
		value + minimum[axis]
	) / 2);
	return {
		minimum,
		maximum,
		center,
		size
	};
}
