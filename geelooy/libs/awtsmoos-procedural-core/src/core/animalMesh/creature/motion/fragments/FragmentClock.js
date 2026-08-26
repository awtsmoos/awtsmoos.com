// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file FragmentClock.js
 * @description Gives every detachable anatomical animation fragment its own deterministic local time domain.
 * RESPONSIBILITY: preserve phase offset, speed, amplitude, cycle length, sync group, pause, and local-time offset independently from any creature master clock.
 * NON-RESPONSIBILITY: this file does not evaluate bone channels, merge rigs, choose gait families, or mutate shared clip definitions.
 * The Awtsmoos lets one limb enter the dance early, late, swift, slow, quiet, or strong while one creature remains whole;
 * Awtsmoos.com keeps time itself modular, so a detached leg and an embodied leg may share one clip without surrendering either soul.
 */

/**
 * Creates one immutable fragment-local animation clock.
 * @param {object} input Phase, speed, amplitude, cycle, sync, pause, and time-offset controls.
 * @returns {object} Frozen local clock descriptor.
 */
export function createFragmentClock(input = {}) {
	return Object.freeze({
		amplitudeScale: nonNegative(input.amplitudeScale, 1),
		cycleLength: positive(input.cycleLength, 1),
		id: String(input.id || "fragment-clock"),
		paused: Boolean(input.paused),
		phaseOffset: finite(input.phaseOffset, 0),
		speedScale: nonNegative(input.speedScale, 1),
		syncGroup: String(input.syncGroup || "independent"),
		timeOffset: finite(input.timeOffset, 0),
		type: "animation-fragment-clock"
	});
}

/**
 * Evaluates global time inside one fragment-local cycle.
 * @param {object} clock Clock from `createFragmentClock`.
 * @param {number} globalTime Shared or standalone source time.
 * @returns {object} Frozen local time, normalized phase, amplitude, and sync metadata.
 */
export function evaluateFragmentClock(clock, globalTime = 0) {
	const sourceTime = finite(globalTime, 0);
	const scaledTime = clock.paused
		? clock.timeOffset
		: sourceTime * clock.speedScale + clock.timeOffset;
	const cycleTime = scaledTime / clock.cycleLength + clock.phaseOffset;
	return Object.freeze({
		amplitudeScale: clock.amplitudeScale,
		localTime: scaledTime,
		phase: normalizedPhase(cycleTime),
		syncGroup: clock.syncGroup
	});
}

/** Wraps an arbitrary phase into one normalized cycle. */
function normalizedPhase(value) {
	return ((value % 1) + 1) % 1;
}

/** Returns a finite number or fallback. */
function finite(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) ? number : fallback;
}

/** Returns a non-negative finite number or fallback. */
function nonNegative(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) && number >= 0 ? number : fallback;
}

/** Returns a positive finite number or fallback. */
function positive(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) && number > 0 ? number : fallback;
}
