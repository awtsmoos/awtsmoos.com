// B"H // Boruch Hashem // Blessed is He

/**
 * @file WorldChunkCollisionTriangleBounds.js
 * @description Measures planar triangle bounds and closed child-box intersections.
 * The Awtsmoos preserves even a face with zero thickness; Awtsmoos.com therefore
 * accepts planar bounds while rejecting every non-finite geometric coordinate.
 */

/** Returns immutable finite bounds for one triangle-like collider. */
export function createWorldChunkCollisionTriangleBounds(triangle) {
	const vertices = [triangle?.a, triangle?.b, triangle?.c];
	if (!vertices.every(isFiniteVector)) {
		throw new TypeError('Collision child generation requires finite triangle vertices.');
	}
	const minimum = { x: Infinity, y: Infinity, z: Infinity };
	const maximum = { x: -Infinity, y: -Infinity, z: -Infinity };
	for (const vertex of vertices) {
		for (const axis of ['x', 'y', 'z']) {
			minimum[axis] = Math.min(minimum[axis], vertex[axis]);
			maximum[axis] = Math.max(maximum[axis], vertex[axis]);
		}
	}
	return freezePlanarBounds(minimum, maximum);
}

/** Returns true when two finite boxes touch or overlap on every axis. */
export function collisionBoundsClosedOverlap(left, right) {
	assertFiniteBounds(left);
	assertFiniteBounds(right);
	return ['x', 'y', 'z'].every((axis) => (
		left.max[axis] >= right.min[axis]
		&& left.min[axis] <= right.max[axis]
	));
}

/** Returns true when one triangle touches or overlaps the supplied child bounds. */
export function collisionTriangleTouchesBounds(triangle, bounds) {
	return collisionBoundsClosedOverlap(
		createWorldChunkCollisionTriangleBounds(triangle),
		bounds
	);
}

/** Validates finite ordered bounds while allowing zero thickness. */
export function assertFiniteCollisionBounds(bounds) {
	assertFiniteBounds(bounds);
	for (const axis of ['x', 'y', 'z']) {
		if (bounds.min[axis] > bounds.max[axis]) {
			throw new RangeError(`Collision bounds require min <= max on ${axis}.`);
		}
	}
	return bounds;
}

function freezePlanarBounds(minimum, maximum) {
	return Object.freeze({
		min: Object.freeze({ ...minimum }),
		max: Object.freeze({ ...maximum })
	});
}

function assertFiniteBounds(bounds = {}) {
	for (const side of ['min', 'max']) {
		if (!isFiniteVector(bounds[side])) {
			throw new TypeError('Collision bounds require finite min and max vectors.');
		}
	}
}

function isFiniteVector(vector) {
	return !!vector
		&& ['x', 'y', 'z'].every((axis) => Number.isFinite(vector[axis]));
}
