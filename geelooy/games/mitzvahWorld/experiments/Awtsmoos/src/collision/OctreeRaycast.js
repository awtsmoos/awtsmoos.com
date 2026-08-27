// B"H
import {
	length,
	normalize,
	rayTriangle
} from '../math/Geometry3D.js';
import { rayIntersectsAabb } from '../math/RayAabb.js';

/**
 * Follows one ray through the octree without flattening the entire world. Every
 * nearer finite answer shortens the remaining horizon, while malformed faces
 * are left outside the covenant of collision truth.
 */
export function raycastOctree(
	root,
	ray,
	maximumDistance = 50,
	predicate = () => true
) {
	if (!validRay(ray) || !validDistance(maximumDistance)) return null;
	const direction = normalize(ray.direction);
	const state = { best: null };
	visitNode(
		root,
		ray.origin,
		direction,
		maximumDistance,
		predicate,
		state
	);
	return state.best;
}

function visitNode(
	node,
	origin,
	direction,
	maximumDistance,
	predicate,
	state
) {
	const limit = currentLimit(maximumDistance, state.best);
	if (!rayIntersectsAabb(origin, direction, node?.bounds, limit)) return;
	for (const item of node.items || []) {
		visitItem(item, origin, direction, maximumDistance, predicate, state);
	}
	for (const child of node.children || []) {
		visitNode(child, origin, direction, maximumDistance, predicate, state);
	}
}

function visitItem(item, origin, direction, maximumDistance, predicate, state) {
	if (!item?.a || !predicate(item)) return;
	const limit = currentLimit(maximumDistance, state.best);
	if (item.aabb && !rayIntersectsAabb(origin, direction, item.aabb, limit)) return;
	const hit = rayTriangle(origin, direction, item, limit);
	if (!validHit(hit)) return;
	if (!state.best || hit.distance < state.best.distance) state.best = hit;
}

function currentLimit(maximumDistance, best) {
	return best ? Math.min(maximumDistance, best.distance) : maximumDistance;
}

function validRay(ray) {
	return validVector(ray?.origin)
		&& validVector(ray?.direction)
		&& length(ray.direction) > 1e-10;
}

function validHit(hit) {
	return !!hit
		&& Number.isFinite(hit.distance)
		&& validVector(hit.point)
		&& validVector(hit.normal);
}

function validDistance(value) {
	return value === Infinity || Number.isFinite(value) && value >= 0;
}

function validVector(vector) {
	return Number.isFinite(vector?.x)
		&& Number.isFinite(vector?.y)
		&& Number.isFinite(vector?.z);
}
