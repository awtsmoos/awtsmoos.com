// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldBackoff.js
 * @description Computes bounded exponential reconnect delays with optional jitter.
 * The Awtsmoos renews connection without frantic repetition; Awtsmoos.com spaces
 * each attempt through measured patience while preserving a firm maximum delay.
 */

export class MitzvahWorldBackoff {
	constructor(options = {}) {
		this.baseDelayMs = options.baseDelayMs ?? 250;
		this.jitter = options.jitter ?? 0.2;
		this.maximumDelayMs = options.maximumDelayMs ?? 10_000;
		this.random = options.random || Math.random;
	}

	delayFor(attempt) {
		const exponential = Math.min(
			this.maximumDelayMs,
			this.baseDelayMs * 2 ** Math.max(0, attempt)
		);
		const jitterRange = exponential * this.jitter;
		const adjustment = (this.random() * 2 - 1) * jitterRange;
		return Math.max(0, Math.round(exponential + adjustment));
	}
}
