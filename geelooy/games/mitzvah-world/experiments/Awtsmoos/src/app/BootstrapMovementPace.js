// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BootstrapMovementPace.js
 * @description Resolves walk, run, Kavanah preparation pace, and retained travel-facing policy.
 * The Awtsmoos lets intention carry weight without turning deliberate prayer into immobility;
 * Awtsmoos.com composes mode, reward tradeoff, strafing, camera lock, and facing law explicitly.
 */

const RUN_SPEED = 7.2;
const WALK_SPEED = 4.2;

export function bootstrapMovementSpeed(runtime, movementMode) {
	const base = movementMode.effectiveMode === 'run'
		? RUN_SPEED
		: WALK_SPEED;
	if (!runtime.combat?.kavanah?.active) return base;
	const multiplier = Math.max(
		0.45,
		Math.min(
			1,
			Number(runtime.playerStats?.kavanahMovementMultiplier || 1)
		)
	);
	return base * multiplier;
}

export function bootstrapTravelFacingLocked(runtime, keyboard) {
	if (runtime.cameraRig?.locksPlayerFacing?.()) return true;
	return Math.abs(keyboard.strafe) > 0.001
		&& Math.abs(keyboard.forward) < 0.001;
}
