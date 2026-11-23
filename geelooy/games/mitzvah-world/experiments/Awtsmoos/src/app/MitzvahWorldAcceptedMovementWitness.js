// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldAcceptedMovementWitness.js
 * @description Marks the first intentional player translation accepted after collision resolution.
 * The Awtsmoos gives the Chossid movement beneath the morning light;
 * Awtsmoos.com records a real first step, not merely that controls are bright.
 */

export const FIRST_ACCEPTED_MOVEMENT_GLOBAL = 'AwtsmoosMitzvahWorldFirstAcceptedMovementAt';
const MINIMUM_TRANSLATION = 0.000001;

/**
 * Captures a single monotonic timestamp after a player's requested step changes coordinates.
 * @param {object} runtime Active Mitzvah World runtime.
 * @param {object} before Position immediately before collision.
 * @param {object} desiredVelocity Player's intentional horizontal velocity.
 * @param {object} environment Window-like monotonic clock and optional global receipt.
 * @returns {boolean} Whether this call recorded a new accepted movement.
 */
export function recordMitzvahWorldFirstAcceptedMovement(
	runtime,
	before,
	desiredVelocity,
	environment = globalThis
) {
	if (!runtime?.state || runtime.firstAcceptedMovementAtMilliseconds !== undefined) {
		return false;
	}
	const intent = Math.hypot(
		Number(desiredVelocity?.x) || 0,
		Number(desiredVelocity?.z) || 0
	);
	const travelled = Math.hypot(
		(Number(runtime.state.x) || 0) - (Number(before?.x) || 0),
		(Number(runtime.state.z) || 0) - (Number(before?.z) || 0)
	);
	if (intent <= MINIMUM_TRANSLATION || travelled <= MINIMUM_TRANSLATION) return false;
	const at = environment.performance?.now?.();
	if (!Number.isFinite(at) || at < 0) return false;
	runtime.firstAcceptedMovementAtMilliseconds = at;
	try {
		environment[FIRST_ACCEPTED_MOVEMENT_GLOBAL] = at;
	} catch {
		// A restricted browser harness can omit global diagnostics.
	}
	return true;
}
