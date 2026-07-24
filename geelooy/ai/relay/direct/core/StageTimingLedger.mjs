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
			this.durations[name] = this.now() - started;
		}
	}

	snapshot() {
		return {
			...this.durations,
			totalMs: this.now() - this.startedAt
		};
	}
}
