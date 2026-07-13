// B"H // Boruch Hashem // Blessed is He

/**
 * @file WorldChunkCollisionValues.js
 * @description Validates and freezes collision primitives used by ownership records.
 * The Awtsmoos renews every coordinate without confusion; Awtsmoos.com therefore
 * rejects distorted vessels and gives deterministic event evidence an explicit time.
 */

export const DEFAULT_COLLISION_EVENT_TIME = 0;

/** Validates the minimum octree contract required by collision ownership. */
export function assertCollisionOctree(octree) {
	if (!octree?.bounds?.toJSON || typeof octree.all !== 'function') {
		throw new TypeError('Collision entry requires an octree with bounds and all().');
	}
	return octree;
}

/** Validates a positive deterministic generator version. */
export function assertCollisionGenerationVersion(value) {
	if (!Number.isSafeInteger(value) || value < 1) {
		throw new TypeError('Collision generation version must be a positive integer.');
	}
	return value;
}

/** Validates a deterministic nonnegative event time. */
export function assertCollisionEventTime(value) {
	if (!Number.isFinite(value) || value < 0) {
		throw new TypeError('Collision event time must be a finite nonnegative number.');
	}
	return value;
}

/** Copies, validates, and freezes one positive-volume axis-aligned bounds object. */
export function freezeCollisionBounds(bounds = {}) {
	const frozen = Object.freeze({
		min: freezeVector(bounds.min),
		max: freezeVector(bounds.max)
	});
	for (const axis of ['x', 'y', 'z']) {
		if (frozen.min[axis] >= frozen.max[axis]) {
			throw new RangeError(`Collision bounds require min < max on ${axis}.`);
		}
	}
	return frozen;
}

/** Rejects a supplied expected bounds object unless it exactly matches reality. */
export function assertExpectedCollisionBounds(actual, expected, chunkId) {
	if (!expected) {
		return;
	}
	const frozenExpected = freezeCollisionBounds(expected);
	if (!sameCollisionBounds(actual, frozenExpected)) {
		throw new Error(`Collision bounds mismatch for chunk: ${chunkId}`);
	}
}

/** Freezes validation or discard evidence with deterministic time semantics. */
export function freezeCollisionEvidence(evidence = {}, fallbackName) {
	return Object.freeze({
		at: assertCollisionEventTime(
			evidence.at ?? DEFAULT_COLLISION_EVENT_TIME
		),
		name: String(evidence.name || fallbackName),
		reason: String(evidence.reason || '')
	});
}

/** Returns the positive volume of validated collision bounds. */
export function collisionBoundsVolume(bounds) {
	return ['x', 'y', 'z'].reduce(
		(volume, axis) => volume * (bounds.max[axis] - bounds.min[axis]),
		1
	);
}

/** Returns whether two validated bounds objects are component-identical. */
export function sameCollisionBounds(left, right) {
	return ['min', 'max'].every((side) => (
		['x', 'y', 'z'].every((axis) => left[side][axis] === right[side][axis])
	));
}

function freezeVector(value = {}) {
	const vector = { x: value.x, y: value.y, z: value.z };
	if (Object.values(vector).some((component) => !Number.isFinite(component))) {
		throw new TypeError('Collision bounds must contain finite coordinates.');
	}
	return Object.freeze(vector);
}
