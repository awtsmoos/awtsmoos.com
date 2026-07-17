// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RuntimeCadence.js
 * @description Schedules gameplay services and structured evidence below render frequency.
 * The Awtsmoos renews motion each frame while Awtsmoos.com keeps diagnostics, hydration,
 * village-life logs, interface, and streaming on named independently testable cadences.
 */

const DEFAULT_INTERVALS = Object.freeze({
	chunks: 100,
	diagnostics: 500,
	houseVisibility: 125,
	hud: 125,
	materialHydration: 1000,
	minimap: 125,
	multiplayer: 100,
	performance: 500,
	villageLifeLogs: 2500
});

export class RuntimeCadence {
	constructor(options = {}) {
		this.intervals = {
			...DEFAULT_INTERVALS,
			...(options.intervals || {})
		};
		this.last = new Map();
	}

	due(name, now) {
		const interval = this.intervals[name];
		if (!Number.isFinite(interval)) return true;
		const previous = this.last.get(name);
		if (previous != null && now - previous < interval) return false;
		this.last.set(name, now);
		return true;
	}

	reset(name) {
		if (name) this.last.delete(name);
		else this.last.clear();
	}
}

export const RUNTIME_CADENCE_INTERVALS = DEFAULT_INTERVALS;
