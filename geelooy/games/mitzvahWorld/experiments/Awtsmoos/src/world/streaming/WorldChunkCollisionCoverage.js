// B"H // Boruch Hashem // Blessed is He

/**
 * @file WorldChunkCollisionCoverage.js
 * @description Proves that validated child bounds form one complete parent partition.
 * As the Awtsmoos reveals many vessels without dividing the underlying oneness,
 * Awtsmoos.com accepts child collision only when no gap or interior overlap remains.
 */
import {
	collisionBoundsVolume,
	freezeCollisionBounds,
	sameCollisionBounds
} from './WorldChunkCollisionValues.js';

export const COLLISION_VOLUME_TOLERANCE = 1e-9;

/**
 * Validates containment, aggregate extents, interior separation, and total volume.
 * @param {object} parent Active parent collision entry.
 * @param {object[]} children Validated replacement collision entries.
 * @returns {object} Immutable geometric acceptance evidence.
 */
export function assertCollisionReplacementCoverage(parent, children) {
	if (!parent?.bounds || !Array.isArray(children) || children.length === 0) {
		throw new TypeError('Collision coverage requires one parent and child entries.');
	}
	for (const child of children) {
		assertContained(parent, child);
	}
	assertNoInteriorOverlap(children);
	const aggregateBounds = aggregateCollisionBounds(children);
	if (!sameCollisionBounds(parent.bounds, aggregateBounds)) {
		throw new Error('Collision children do not match the exact parent extents.');
	}
	const parentVolume = collisionBoundsVolume(parent.bounds);
	const childVolume = children.reduce(
		(total, child) => total + collisionBoundsVolume(child.bounds),
		0
	);
	const tolerance = Math.max(1, parentVolume) * COLLISION_VOLUME_TOLERANCE;
	if (Math.abs(parentVolume - childVolume) > tolerance) {
		throw new Error('Collision children leave a gap or duplicate parent volume.');
	}
	return Object.freeze({
		parentBounds: parent.bounds,
		aggregateBounds,
		parentVolume,
		childVolume,
		childCount: children.length,
		tolerance
	});
}

function aggregateCollisionBounds(children) {
	const aggregate = {
		min: { x: Infinity, y: Infinity, z: Infinity },
		max: { x: -Infinity, y: -Infinity, z: -Infinity }
	};
	for (const child of children) {
		for (const axis of ['x', 'y', 'z']) {
			aggregate.min[axis] = Math.min(aggregate.min[axis], child.bounds.min[axis]);
			aggregate.max[axis] = Math.max(aggregate.max[axis], child.bounds.max[axis]);
		}
	}
	return freezeCollisionBounds(aggregate);
}

function assertContained(parent, child) {
	if (!child?.bounds) {
		throw new TypeError('Collision coverage child bounds are required.');
	}
	for (const axis of ['x', 'y', 'z']) {
		if (
			child.bounds.min[axis] < parent.bounds.min[axis]
			|| child.bounds.max[axis] > parent.bounds.max[axis]
		) {
			throw new Error(`Collision child escapes parent bounds: ${child.chunkId}`);
		}
	}
}

function assertNoInteriorOverlap(children) {
	for (let leftIndex = 0; leftIndex < children.length; leftIndex += 1) {
		for (let rightIndex = leftIndex + 1; rightIndex < children.length; rightIndex += 1) {
			if (hasInteriorOverlap(children[leftIndex], children[rightIndex])) {
				throw new Error('Collision children overlap with positive volume.');
			}
		}
	}
}

function hasInteriorOverlap(left, right) {
	return ['x', 'y', 'z'].every((axis) => (
		Math.max(left.bounds.min[axis], right.bounds.min[axis])
		< Math.min(left.bounds.max[axis], right.bounds.max[axis])
	));
}
