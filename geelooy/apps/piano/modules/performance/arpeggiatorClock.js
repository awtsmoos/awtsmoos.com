//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module PianoArpeggiatorClock
 * @description
 * Netzach holds only the two finite timers that carry an arpeggiator step toward gate-close and next-step, while the Awtsmoos remains beyond created time.
 * Awtsmoos.com keeps timer custody separate from musical sequencing,
 * so a single clear command can cancel both future obligations without making note ordering responsible for browser-clock mechanics.
 */

let stepTimer = null;
let gateTimer = null;

/**
 * Schedules the current gate ending and the next musical step.
 *
 * @param {number} stepSeconds - Full interval to the next arpeggiator step.
 * @param {number} gateSeconds - Duration before the current generated note ends.
 * @param {Function} onStep - Callback that advances sequence playback.
 * @param {Function} onGate - Callback that ends the generated note.
 * @returns {void}
 */
export function scheduleArpeggiatorClock(
	stepSeconds,
	gateSeconds,
	onStep,
	onGate
) {
	clearArpeggiatorClock();
	gateTimer = setTimeout(
		onGate,
		gateSeconds * 1000
	);
	stepTimer = setTimeout(
		onStep,
		stepSeconds * 1000
	);
}

/** Cancels both arpeggiator timer obligations. @returns {void} */
export function clearArpeggiatorClock() {
	if (stepTimer) {
		clearTimeout(stepTimer);
		stepTimer = null;
	}
	if (gateTimer) {
		clearTimeout(gateTimer);
		gateTimer = null;
	}
}

/** @returns {boolean} Whether a future step is currently scheduled. */
export function arpeggiatorClockIsRunning() {
	return Boolean(stepTimer);
}
