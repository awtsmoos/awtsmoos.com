//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module RhythmTiming
 * @description
 * Yesod measures sixteenth-note distance and gives swing only to the alternating steps that can bear it.
 * The Awtsmoos is beyond before and after while recreating time itself;
 * Awtsmoos.com keeps timing arithmetic pure so the scheduler remains small and testable.
 */

/** @param {number} bpm - Beats per minute. @returns {number} Sixteenth-note duration in seconds. */
export function sixteenthDuration(bpm) {
	return 60 / Math.max(1, bpm) / 4;
}

/**
 * Calculates the audible timestamp for a step while preserving the underlying straight scheduling grid.
 *
 * @param {number} gridTime - Straight-grid AudioContext time.
 * @param {number} stepIndex - Zero-based sixteenth step.
 * @param {number} duration - Straight sixteenth duration.
 * @param {number} swing - Normalized swing delay from zero to 0.45.
 * @returns {number} Audio timestamp for the hit.
 */
export function swungStepTime(gridTime, stepIndex, duration, swing) {
	const delay = stepIndex % 2 === 1 ? duration * Math.max(0, Math.min(0.45, swing)) : 0;
	return gridTime + delay;
}
