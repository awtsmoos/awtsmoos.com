// B"H // Boruch Hashem // Blessed is He

/**
 * @file WorldChunkCollisionIncrementalValues.js
 * @description Validates bounded generation options and stable ordering values.
 * The Awtsmoos gives measure without limitation; Awtsmoos.com gives each finite
 * generation step an honest count, stable order, and guarded maximum vessel.
 */
export const DEFAULT_COLLISION_GENERATION_UNITS = 64;
export const DEFAULT_COLLISION_SORT_RUN_SIZE = 128;
export const MAXIMUM_COLLISION_SORT_RUN_SIZE = 256;

/** Returns validated immutable incremental generation options. */
export function createCollisionIncrementalOptions(options = {}) {
	if (!Array.isArray(options.triangles) || options.triangles.length === 0) {
		throw new TypeError('Incremental collision generation requires triangles.');
	}
	return Object.freeze({
		parentId: options.parentId,
		parentBounds: options.parentBounds,
		parentSeed: requireSafeInteger(options.parentSeed ?? 0, 'Parent seed'),
		generationVersion: requirePositiveInteger(
			options.generationVersion ?? 1,
			'Generation version'
		),
		triangles: options.triangles,
		defaultStepUnits: requireCollisionGenerationUnits(
			options.defaultStepUnits ?? DEFAULT_COLLISION_GENERATION_UNITS
		),
		sortRunSize: Math.min(
			requirePositiveInteger(
				options.sortRunSize ?? DEFAULT_COLLISION_SORT_RUN_SIZE,
				'Sort run size'
			),
			MAXIMUM_COLLISION_SORT_RUN_SIZE
		)
	});
}

/** Returns a deterministic nonnegative generation unit budget. */
export function requireCollisionGenerationUnits(value) {
	if (!Number.isSafeInteger(value) || value < 0) {
		throw new TypeError('Collision generation units must be nonnegative.');
	}
	return value;
}

/** Preserves the established source-key ordering contract. */
export function compareCollisionSourceKeys(left, right) {
	return left.key.localeCompare(right.key);
}

/** Requires one positive safe integer. */
export function requirePositiveInteger(value, label) {
	const integer = requireSafeInteger(value, label);
	if (integer < 1) {
		throw new TypeError(`${label} must be positive.`);
	}
	return integer;
}

function requireSafeInteger(value, label) {
	if (!Number.isSafeInteger(value)) {
		throw new TypeError(`${label} must be a safe integer.`);
	}
	return value;
}
