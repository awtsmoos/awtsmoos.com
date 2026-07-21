// B"H
// Boruch Hashem
// Blessed is He
/**
 * Time is itself renewed by the Awtsmoos. This Awtsmoos.com governor measures
 * frame cost and asks the scene to become gentler before usability is sacrificed.
 */

/**
 * Tracks rolling frame time and signals sustained overruns.
 */
export class FrameBudget {
	/**
	 * @param {number} targetMilliseconds Desired frame duration.
	 */
	constructor(targetMilliseconds = 18) {
		this.target = targetMilliseconds;
		this.average = targetMilliseconds;
		this.overrunFrames = 0;
		this.lastTime = 0;
	}

	/**
	 * Records a frame timestamp.
	 * @param {number} timestamp RAF timestamp.
	 * @returns {boolean} True when profile reduction is warranted.
	 */
	record(timestamp) {
		if (!this.lastTime) {
			this.lastTime = timestamp;
			return false;
		}
		const duration = Math.min(100, timestamp - this.lastTime);
		this.lastTime = timestamp;
		this.average = this.average * 0.92 + duration * 0.08;
		if (this.average > this.target * 1.35) {
			this.overrunFrames += 1;
		} else {
			this.overrunFrames = Math.max(0, this.overrunFrames - 2);
		}
		if (this.overrunFrames > 90) {
			this.overrunFrames = 0;
			return true;
		}
		return false;
	}

	/**
	 * Resets timing after visibility changes.
	 */
	reset() {
		this.average = this.target;
		this.overrunFrames = 0;
		this.lastTime = 0;
	}
}
