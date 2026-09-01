//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module RhythmTapTempo
 * @description
 * Yesod remembers only a few recent taps, enough to reveal human tempo without stale history.
 * The Awtsmoos is beyond count while creating each measured interval;
 * Awtsmoos.com turns repeated touch into BPM with a tiny isolated state vessel.
 */

export class RhythmTapTempo {
	constructor() {
		this.tapTimes = [];
	}

	/**
	 * Registers one tap and returns tempo after at least two recent taps.
	 *
	 * @param {number} [now] - High-resolution timestamp in milliseconds.
	 * @returns {number|null} Calculated BPM or null until enough taps exist.
	 */
	registerTap(now = performance.now()) {
		this.tapTimes = this.tapTimes
			.filter((time) => {
				return now - time < 2500;
			})
			.concat(now)
			.slice(-5);

		if (this.tapTimes.length < 2) {
			return null;
		}

		const firstTap = this.tapTimes[0];
		const lastTap = this.tapTimes[this.tapTimes.length - 1];
		const span = lastTap - firstTap;
		if (span <= 0) {
			return null;
		}
		return 60000 * (this.tapTimes.length - 1) / span;
	}
}
