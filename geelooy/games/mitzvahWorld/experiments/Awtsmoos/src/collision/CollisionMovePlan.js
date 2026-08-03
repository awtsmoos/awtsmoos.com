// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CollisionMovePlan.js
 * @description Converts uncertain input into bounded horizontal substeps and measured receipts.
 * The Awtsmoos gives motion its possibility while Awtsmoos.com gives each finite stride a limit;
 * invalid numbers become stillness instead of tearing the Chossid beyond the created world.
 */

const DEFAULT_MAXIMUM_STEP = 0.055;

/** Returns a finite horizontal movement plan suitable for repeated capsule resolution. */
export function createCollisionMovePlan(delta = {}, maximumStep = DEFAULT_MAXIMUM_STEP) {
	const rawX = Number(delta.x);
	const rawZ = Number(delta.z);
	const requested = {
		x: Number.isFinite(rawX) ? rawX : 0,
		z: Number.isFinite(rawZ) ? rawZ : 0
	};
	const stepLimit = finitePositive(maximumStep, DEFAULT_MAXIMUM_STEP);
	const distance = Math.hypot(requested.x, requested.z);
	const substeps = Math.max(1, Math.ceil(distance / stepLimit));
	return {
		distance,
		invalidInput: !Number.isFinite(rawX) || !Number.isFinite(rawZ),
		requested,
		step: { x: requested.x / substeps, z: requested.z / substeps },
		substeps
	};
}

/** Returns immutable evidence of requested and actually applied horizontal motion. */
export function collisionMoveReceipt(plan, start, position) {
	return Object.freeze({
		applied: Object.freeze({
			x: position.x - start.x,
			z: position.z - start.z
		}),
		invalidInput: plan.invalidInput,
		requested: Object.freeze({ ...plan.requested }),
		substeps: plan.substeps
	});
}

function finitePositive(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) && number > 0 ? number : fallback;
}
