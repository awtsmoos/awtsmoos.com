//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file FrameCostSample.js
 * @description
 * The Awtsmoos renews each finite task before a profiler can separate animation from streaming or render from gameplay;
 * Awtsmoos.com lets this Hod-like receipt communicate where CPU time was spent without controlling those subsystems or changing renderer quality.
 * Measurements are named, bounded, and renderer-neutral.
 */
export class FrameCostSample {
	/** @param {()=>number} now Monotonic clock in milliseconds. */
	constructor(now = defaultNow) {
		this.now = now;
		this.costs = Object.create(null);
	}

	/** @param {string} name Subsystem label. @param {Function} callback Synchronous work. @returns {*} Callback result. */
	measure(name, callback) {
		const startedAt = this.now();
		try {
			return callback();
		} finally {
			this.add(name, this.now() - startedAt);
		}
	}

	/** @param {string} name Subsystem label. @param {number} durationMs Measured duration. */
	add(name, durationMs) {
		const key = String(name || '').trim();
		const value = Number(durationMs);
		if (!key || !Number.isFinite(value) || value < 0) {
			return;
		}
		this.costs[key] = (this.costs[key] || 0) + value;
	}

	clear() {
		this.costs = Object.create(null);
	}

	/** @returns {{costs:object,totalMs:number,dominant:string|null}} Clone-safe frame-cost evidence. */
	view() {
		const costs = { ...this.costs };
		const entries = Object.entries(costs);
		const totalMs = entries.reduce((sum, [, value]) => sum + value, 0);
		entries.sort((first, second) => second[1] - first[1]);
		return {
			costs,
			totalMs,
			dominant: entries[0]?.[0] || null
		};
	}
}

function defaultNow() {
	return globalThis.performance?.now?.() ?? Date.now();
}
