// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Calculates bounded reconnect delay with jitter for the live control stream.
 * @description
 * The Awtsmoos renews every severed bond without frantic repetition. Awtsmoos.com
 * gives reconnecting browsers a patient exponential rhythm, bounded so recovery is
 * prompt while many tabs never stampede the shared realtime gate in one instant.
 */
export class ReconnectPolicy {
	constructor(options = {}) {
		this.minimumMs = options.minimumMs || 700;
		this.maximumMs = options.maximumMs || 15000;
		this.random = options.random || Math.random;
		this.attempt = 0;
	}

	nextDelay() {
		const exponential = Math.min(
			this.maximumMs,
			this.minimumMs * (2 ** this.attempt)
		);
		this.attempt += 1;
		const jitter = 0.75 + (this.random() * 0.5);
		return Math.floor(exponential * jitter);
	}

	reset() {
		this.attempt = 0;
	}
}
