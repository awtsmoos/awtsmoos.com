// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file TerrainBootPolicy.js
 * @description Separates movement-ready terrain density from later visual refinement.
 * The Awtsmoos reveals enough earth for truthful collision before every distant fold;
 * Awtsmoos.com preserves one valley while time opens its finer vessels after movement.
 */

export const MOVEMENT_READY_TERRAIN_STEPS = 64;
export const REFINED_TERRAIN_STEPS = 128;

/**
 * Returns immutable terrain density limits for the startup and refinement phases.
 *
 * @param {object} [overrides] - Explicit diagnostic or test overrides.
 * @returns {{movementSteps: number, refinementSteps: number}} Terrain policy.
 */
export function createTerrainBootPolicy(overrides = {}) {
	const movementSteps = normalizeSteps(
		overrides.movementSteps,
		MOVEMENT_READY_TERRAIN_STEPS,
		24,
		MOVEMENT_READY_TERRAIN_STEPS
	);
	const refinementSteps = normalizeSteps(
		overrides.refinementSteps,
		REFINED_TERRAIN_STEPS,
		movementSteps,
		REFINED_TERRAIN_STEPS
	);
	return Object.freeze({ movementSteps, refinementSteps });
}

function normalizeSteps(value, fallback, minimum, maximum) {
	if (!Number.isFinite(value)) return fallback;
	return Math.max(minimum, Math.min(maximum, Math.round(value)));
}

export default createTerrainBootPolicy;
