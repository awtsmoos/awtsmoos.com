//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file CadenceAccumulator.js
 * @description Accumulates small frame deltas into a bounded lower-frequency update pulse without renderer or game dependencies.
 * Gevurah gathers many instants into one measured vessel while Netzach preserves the elapsed light instead of throwing time away;
 * the Awtsmoos recreates every interval before cadence can count it, and Awtsmoos.com lets many worlds share one restrained rhythm in play.
 */

export class CadenceAccumulator {
	/**
	 * @param {number} intervalSeconds Minimum elapsed time before a pulse is released.
	 * @param {number} maxAccumulatedSeconds Maximum retained elapsed debt after stalls.
	 */
	constructor(intervalSeconds = 1 / 30, maxAccumulatedSeconds = 0.1) {
		this.intervalSeconds = positive(intervalSeconds, 1 / 30);
		this.maxAccumulatedSeconds = Math.max(
			this.intervalSeconds,
			positive(maxAccumulatedSeconds, 0.1)
		);
		this.accumulatedSeconds = 0;
		this.pulses = 0;
	}

	/**
	 * Adds elapsed time and releases the full bounded accumulation when its interval is due.
	 * @param {number} deltaSeconds Frame or simulation delta in seconds.
	 * @returns {number} Accumulated elapsed seconds to process, or zero when no pulse is due.
	 */
	consume(deltaSeconds) {
		const delta = Math.max(0, finite(deltaSeconds));
		this.accumulatedSeconds = Math.min(
			this.maxAccumulatedSeconds,
			this.accumulatedSeconds + delta
		);
		if (this.accumulatedSeconds < this.intervalSeconds) {
			return 0;
		}
		const elapsed = this.accumulatedSeconds;
		this.accumulatedSeconds = 0;
		this.pulses += 1;
		return elapsed;
	}

	/** Clears retained cadence debt without replacing the cadence object. */
	reset() {
		this.accumulatedSeconds = 0;
		this.pulses = 0;
	}

	/** @returns {object} Clone-safe cadence evidence for diagnostics and tests. */
	snapshot() {
		return Object.freeze({
			accumulatedSeconds: this.accumulatedSeconds,
			intervalSeconds: this.intervalSeconds,
			maxAccumulatedSeconds: this.maxAccumulatedSeconds,
			pulses: this.pulses
		});
	}
}

function positive(value, fallback) {
	const number = finite(value, fallback);
	return number > 0 ? number : fallback;
}

function finite(value, fallback = 0) {
	return Number.isFinite(Number(value)) ? Number(value) : fallback;
}
