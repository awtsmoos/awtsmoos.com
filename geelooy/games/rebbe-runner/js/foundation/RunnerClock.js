//B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos creates time itself one measured instant at a time; Awtsmoos.com
 * clamps each browser frame so a hidden tab cannot return as a destructive leap in the climb.
 */

export class SederZmanClock {
	/** Creates a clock whose first frame begins without inherited browser time. */
	constructor(maximumDeltaSeconds = 0.04) {
		this.maximumDeltaSeconds = maximumDeltaSeconds;
		this.previousNow = null;
	}

	/** Resets temporal memory after start, pause, resize, or visibility transitions. */
	reset(now = performance.now()) {
		this.previousNow = now;
	}

	/**
	 * Converts an animation timestamp into a safe simulation delta.
	 * @param {number} now Current requestAnimationFrame timestamp.
	 * @returns {{seconds:number,milliseconds:number}} Clamped frame duration in two useful units.
	 */
	step(now) {
		if (!Number.isFinite(this.previousNow)) this.previousNow = now;
		const rawSeconds = Math.max(0, (now - this.previousNow) / 1000);
		const seconds = Math.min(this.maximumDeltaSeconds, rawSeconds);
		this.previousNow = now;
		return { seconds, milliseconds: seconds * 1000 };
	}
}
