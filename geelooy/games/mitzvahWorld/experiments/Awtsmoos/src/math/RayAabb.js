// B"H

const AXES = ['x', 'y', 'z'];
const PARALLEL_EPSILON = 1e-10;

/**
 * Tests whether a normalized ray reaches an axis-aligned box before its finite
 * horizon. The slab closes around only the path that exists; malformed numbers
 * cannot pretend to be a doorway through the world.
 */
export function rayIntersectsAabb(
	origin,
	direction,
	bounds,
	maximumDistance = Infinity
) {
	if (!validVector(origin) || !validVector(direction)) return false;
	if (!validBounds(bounds) || !validDistance(maximumDistance)) return false;
	let nearDistance = 0;
	let farDistance = maximumDistance;
	for (const axis of AXES) {
		const component = direction[axis];
		if (Math.abs(component) < PARALLEL_EPSILON) {
			if (outsideSlab(origin[axis], bounds, axis)) return false;
			continue;
		}
		const distances = slabDistances(origin[axis], component, bounds, axis);
		nearDistance = Math.max(nearDistance, distances.near);
		farDistance = Math.min(farDistance, distances.far);
		if (farDistance < nearDistance) return false;
	}
	return farDistance >= 0;
}

function slabDistances(origin, direction, bounds, axis) {
	let near = (bounds.min[axis] - origin) / direction;
	let far = (bounds.max[axis] - origin) / direction;
	if (near > far) [near, far] = [far, near];
	return { near, far };
}

function outsideSlab(value, bounds, axis) {
	return value < bounds.min[axis] || value > bounds.max[axis];
}

function validDistance(value) {
	return value === Infinity || Number.isFinite(value) && value >= 0;
}

function validBounds(bounds) {
	if (!validVector(bounds?.min) || !validVector(bounds?.max)) return false;
	return AXES.every((axis) => bounds.min[axis] <= bounds.max[axis]);
}

function validVector(vector) {
	return AXES.every((axis) => Number.isFinite(vector?.[axis]));
}
