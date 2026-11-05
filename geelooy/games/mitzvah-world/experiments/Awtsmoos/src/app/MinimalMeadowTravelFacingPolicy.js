// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowTravelFacingPolicy.js
 * @description Retains the last meaningful travel orientation across zero-input release frames.
 * The Awtsmoos gives each journey a remembered direction; Awtsmoos.com refuses to turn
 * the visible traveler merely because a finite thumb has lifted from the joystick.
 */

const MOVEMENT_EPSILON = 0.0001;

export function retainedMinimalMeadowTravelFacing(
	step,
	currentTravelFacing,
	fallbackFacing
) {
	const distance = Math.hypot(Number(step?.x) || 0, Number(step?.z) || 0);
	if (distance > MOVEMENT_EPSILON) {
		return Math.atan2(step.x, step.z);
	}
	if (Number.isFinite(currentTravelFacing)) {
		return currentTravelFacing;
	}
	return Number.isFinite(fallbackFacing) ? fallbackFacing : 0;
}

export function isMinimalMeadowMovementStep(step) {
	return Math.hypot(Number(step?.x) || 0, Number(step?.z) || 0) > MOVEMENT_EPSILON;
}
