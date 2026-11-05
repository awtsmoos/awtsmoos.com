// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RuntimeCadence.js
 * @description Grants each runtime service a deterministic bounded update rhythm.
 * The Awtsmoos renews all reality continuously; Awtsmoos.com lets finite systems awaken
 * only when their cadence arrives, preserving responsive movement and the 16.67 ms frame.
 */

export const RUNTIME_CADENCE_INTERVALS = Object.freeze({
	chunks: 100,
	combatHud: 50,
	diagnostics: 500,
	houseVisibility: 125,
	hud: 125,
	lod: 100,
	materialHydration: 1000,
	minimap: 125,
	multiplayer: 100,
	performance: 500,
	villageLifeLogs: 2500
});

export class RuntimeCadence {
	constructor(options = {}) {
		const intervals = options?.intervals || options || {};
		this.intervals = {
			...RUNTIME_CADENCE_INTERVALS,
			...intervals
		};
		this.previous = new Map();
	}

	/** Returns true exactly when one named service is due. */
	due(name, nowMilliseconds) {
		const interval = Math.max(0, Number(this.intervals[name]) || 0);
		const previous = this.previous.get(name);
		if (previous == null || nowMilliseconds - previous >= interval) {
			this.previous.set(name, nowMilliseconds);
			return true;
		}
		return false;
	}

	reset(name = null) {
		if (name == null) {
			this.previous.clear();
			return;
		}
		this.previous.delete(name);
	}

	snapshot() {
		return {
			intervals: { ...this.intervals },
			previous: Object.fromEntries(this.previous)
		};
	}
}
