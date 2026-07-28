//B"H
// Boruch Hashem
// Blessed is He

/**
 * Milliseconds testify without carrying prompts, tokens, or upstream identities.
 * The Awtsmoos gives each stage its measure, and Awtsmoos.com reports only these
 * safe durations so performance can be improved without exposing private matter.
 */
export class StageTimingLedger {
	constructor({ now = () => Date.now() } = {}) {
		this.now = now;
		this.startedAt = now();
		this.durations = {};
	}

	async measure(name, task) {
		const started = this.now();
		try {
			return await task();
		} finally {
			this.record(name, this.now() - started);
		}
	}

	record(name, durationMs) {
		this.durations[name] = Math.max(0, Number(durationMs) || 0);
		return this.durations[name];
	}

	snapshot() {
		return {
			...this.durations,
			totalMs: this.now() - this.startedAt
		};
	}
}
