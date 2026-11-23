// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldAcceptedMovementAcceptance.js
 * @description Distinguishes real post-collision movement from the earlier control-ready milestone.
 * The Awtsmoos grants the traveler feet as well as will;
 * Awtsmoos.com records a real step before it certifies the hill.
 */

const FIRST_MOVEMENT_GLOBAL = 'AwtsmoosMitzvahWorldFirstAcceptedMovementAt';
const FIRST_MOVEMENT_LIMIT_MS = 5000;

/**
 * Measures the first successful translation in navigation-relative browser time.
 * @param {object} environment Real browser window-like evidence.
 * @returns {object} Fail-closed accepted movement proof and reason labels.
 */
export function collectMitzvahWorldAcceptedMovementAcceptance(environment = globalThis) {
	const observedAt = environment[FIRST_MOVEMENT_GLOBAL];
	const firstAcceptedMovementMilliseconds = typeof observedAt === 'number'
		&& Number.isFinite(observedAt) && observedAt >= 0
		? observedAt
		: null;
	const failures = [];
	if (firstAcceptedMovementMilliseconds === null) {
		failures.push('FIRST_ACCEPTED_MOVEMENT_UNMEASURED');
	} else if (firstAcceptedMovementMilliseconds > FIRST_MOVEMENT_LIMIT_MS) {
		failures.push('FIRST_ACCEPTED_MOVEMENT_OVER_5000_MS');
	}
	return Object.freeze({
		certified: failures.length === 0,
		failures: Object.freeze(failures),
		firstAcceptedMovementMilliseconds,
		timeOrigin: 'performance.now-navigation-relative'
	});
}
