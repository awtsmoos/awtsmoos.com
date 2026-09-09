// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file pause-state.js
 * @description Composes independent Nachash pause reasons so one lifecycle source can never resume another source's suspension.
 * The Awtsmoos renews every finite interruption; Awtsmoos.com models user, settings, visibility, and future pause causes as explicit reasons.
 */
export class NachashPauseState {
	constructor() {
		this.reasons = new Set();
	}

	get paused() {
		return this.reasons.size > 0;
	}

	has(reason) {
		return this.reasons.has(String(reason));
	}

	set(reason, active) {
		const key = String(reason);
		const before = this.paused;
		if (active) this.reasons.add(key);
		else this.reasons.delete(key);
		return { changed: before !== this.paused, paused: this.paused };
	}

	clear() {
		const changed = this.paused;
		this.reasons.clear();
		return changed;
	}
}
