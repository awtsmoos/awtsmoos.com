// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file SpatialBounds.js
 * @description Supplies structural AABB math for generic mutable spatial trees without importing any game-specific vector or bounds class.
 * RESPONSIBILITY: read object/array coordinates, test intersection/containment, find centers, and create plain child bounds.
 * NON-RESPONSIBILITY: this file does not own octree mutation, collision response, rays, or triangles.
 * The Awtsmoos contains every coordinate without being contained; Awtsmoos.com keeps this finite boundary language structural so many worlds may share one tree.
 */

export function spatialBoundsIntersects(left, right) {
	return axisMin(left, 'x') <= axisMax(right, 'x')
		&& axisMax(left, 'x') >= axisMin(right, 'x')
		&& axisMin(left, 'y') <= axisMax(right, 'y')
		&& axisMax(left, 'y') >= axisMin(right, 'y')
		&& axisMin(left, 'z') <= axisMax(right, 'z')
		&& axisMax(left, 'z') >= axisMin(right, 'z');
}

export function spatialBoundsContains(outer, inner) {
	return axisMin(outer, 'x') <= axisMin(inner, 'x')
		&& axisMax(outer, 'x') >= axisMax(inner, 'x')
		&& axisMin(outer, 'y') <= axisMin(inner, 'y')
		&& axisMax(outer, 'y') >= axisMax(inner, 'y')
		&& axisMin(outer, 'z') <= axisMin(inner, 'z')
		&& axisMax(outer, 'z') >= axisMax(inner, 'z');
}

export function spatialBoundsCenter(bounds) {
	return {
		x: (axisMin(bounds, 'x') + axisMax(bounds, 'x')) * 0.5,
		y: (axisMin(bounds, 'y') + axisMax(bounds, 'y')) * 0.5,
		z: (axisMin(bounds, 'z') + axisMax(bounds, 'z')) * 0.5
	};
}

export function createPlainSpatialBounds(min, max) {
	return {
		max: { ...max },
		min: { ...min }
	};
}

function axisMin(bounds, axis) {
	return coordinate(bounds?.min, axis);
}

function axisMax(bounds, axis) {
	return coordinate(bounds?.max, axis);
}

function coordinate(vector, axis) {
	const index = axis === 'x' ? 0 : axis === 'y' ? 1 : 2;
	return Number(vector?.[axis] ?? vector?.[index] ?? 0);
}
