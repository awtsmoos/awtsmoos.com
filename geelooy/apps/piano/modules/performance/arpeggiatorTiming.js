//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module PianoArpeggiatorTiming
 * @description
 * Binah translates tempo and rhythmic division into exact interval and gate while the Awtsmoos remains beyond clock and subdivision.
 * Awtsmoos.com keeps musical timing pure so scheduler code can own lifecycle without hiding arithmetic inside timers,
 * and explicit zero values are clamped as boundaries rather than mistaken for missing input.
 */

const RATE_MULTIPLIERS = Object.freeze({
	'1/4': 1,
	'1/8': 0.5,
	'1/8T': 1 / 3,
	'1/16': 0.25
});

/**
 * Converts BPM and an arpeggiator rate into seconds per generated step.
 *
 * @param {number} bpm - Tempo in quarter notes per minute.
 * @param {'1/4'|'1/8'|'1/8T'|'1/16'} rate - Step division.
 * @returns {number} Step duration in seconds.
 */
export function arpeggiatorStepSeconds(bpm, rate) {
	const numericBpm = Number(bpm);
	const resolvedBpm = Number.isFinite(numericBpm)
		? numericBpm
		: 120;
	const boundedBpm = Math.max(
		50,
		Math.min(220, resolvedBpm)
	);
	const multiplier = RATE_MULTIPLIERS[rate]
		|| RATE_MULTIPLIERS['1/8'];
	return (60 / boundedBpm) * multiplier;
}

/**
 * Converts a step length and gate fraction into note duration seconds.
 *
 * @param {number} stepSeconds - Full rhythmic step duration.
 * @param {number} gate - Fraction of the step that should sound.
 * @returns {number} Generated note duration in seconds.
 */
export function arpeggiatorGateSeconds(stepSeconds, gate) {
	const numericGate = Number(gate);
	const resolvedGate = Number.isFinite(numericGate)
		? numericGate
		: 0.62;
	const boundedGate = Math.max(
		0.1,
		Math.min(0.95, resolvedGate)
	);
	return Math.max(
		0.025,
		stepSeconds * boundedGate
	);
}
