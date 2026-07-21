// B"H
// Boruch Hashem
// Blessed is He
/**
 * Time is renewed by the Awtsmoos, yet responsiveness must be guarded. This
 * Awtsmoos.com governor detects sustained slowdown quickly without reacting to one spike.
 */

const AVERAGE_WEIGHT = 0.12;
const OVERRUN_MULTIPLIER = 1.24;
const REQUIRED_OVERRUNS = 42;

/** Tracks rolling frame duration and signals a measured profile reduction. */
export class FrameBudget {
	constructor(targetMilliseconds = 16.9) {
		this.target = targetMilliseconds;
		this.reset();
	}

	/** Records one RAF timestamp and returns true after sustained slowdown. */
	record(timestamp) {
		if (!this.lastTime) {
			this.lastTime = timestamp;
			return false;
		}
		const duration = Math.min(100, timestamp - this.lastTime);
		this.lastTime = timestamp;
		this.average =
			this.average * (1 - AVERAGE_WEIGHT) +
			duration * AVERAGE_WEIGHT;
		if (this.average > this.target * OVERRUN_MULTIPLIER) {
			this.overrunFrames += 1;
		} else {
			this.overrunFrames = Math.max(0, this.overrunFrames - 3);
		}
		if (this.overrunFrames >= REQUIRED_OVERRUNS) {
			this.overrunFrames = 0;
			return true;
		}
		return false;
	}

	/** Resets timing after visibility or profile changes. */
	reset() {
		this.average = this.target;
		this.overrunFrames = 0;
		this.lastTime = 0;
	}
}
