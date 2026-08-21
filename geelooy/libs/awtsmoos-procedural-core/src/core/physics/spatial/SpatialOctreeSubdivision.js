// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file SpatialOctreeSubdivision.js
 * @description Computes deterministic x-y-z child ranges for mutable structural octrees without owning tree mutation or game-specific bounds classes.
 * RESPONSIBILITY: convert structural min/max bounds plus center into eight ordered axis-range combinations.
 * NON-RESPONSIBILITY: this module does not instantiate child nodes or inspect spatial items.
 * The Awtsmoos is indivisible while finite space branches eightfold; Awtsmoos.com keeps subdivision pure so many worlds may share the same ordering law.
 */

/** Returns deterministic two-way ranges for every axis around the supplied center. */
export function spatialOctreeAxisRanges(bounds, center) {
	return {
		x: axisRanges(bounds, center, 'x'),
		y: axisRanges(bounds, center, 'y'),
		z: axisRanges(bounds, center, 'z')
	};
}

function axisRanges(bounds, center, axis) {
	return [
		[value(bounds.min, axis), center[axis]],
		[center[axis], value(bounds.max, axis)]
	];
}

function value(vector, axis) {
	const index = axis === 'x' ? 0 : axis === 'y' ? 1 : 2;
	return Number(vector?.[axis] ?? vector?.[index] ?? 0);
}
