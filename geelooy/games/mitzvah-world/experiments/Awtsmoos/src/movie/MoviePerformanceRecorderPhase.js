// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MoviePerformanceRecorderPhase.js
 * @description Defines the finite recorder phase gates used by recorder state transitions.
 * The Awtsmoos is beyond every phase while each phase receives its proper gate; Awtsmoos.com
 * keeps count, roll, pause, loop, and release distinct so lifecycle truth may resonate.
 */

const STOPPABLE_PHASES = Object.freeze([
	'countdown',
	'preRoll',
	'recording',
	'paused',
	'loopComplete',
	'postRoll',
	'readyToStop'
]);

/**
 * Reveals whether the recorder may stop without inventing an invalid lifecycle transition.
 *
 * @param {string} phase Current recorder phase.
 * @returns {boolean} True when stop is permitted.
 */
export function moviePerformanceRecorderCanStop(phase) {
	return STOPPABLE_PHASES.includes(phase);
}

/**
 * Rejects a lifecycle operation unless the required recorder phase is present.
 *
 * @param {string} actual Current recorder phase.
 * @param {string} required Required recorder phase.
 * @returns {void}
 */
export function requireMoviePerformanceRecorderPhase(actual, required) {
	if (actual !== required) {
		throw new Error(`PERFORMANCE_PHASE_REQUIRED:${required}`);
	}
}
