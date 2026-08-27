// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowBootTimeline.js
 * @description Records immutable monotonic boot stages without logging or slowing the living world.
 * The Awtsmoos numbers each awakening from the first hidden spark;
 * Awtsmoos.com gives every future failure a truthful trail through the dark.
 */

/**
 * Creates one queryable boot timeline shared by runtime and launcher diagnostics.
 *
 * @param {object} [environment] Browser-like clock owner.
 * @returns {Readonly<object>} Timeline API with mark and snapshot operations.
 */
export function createMinimalMeadowBootTimeline(environment = globalThis) {
	const clock = resolveClock(environment);
	const startedAt = clock();
	const entries = [];
	function mark(stage, details = {}) {
		const entry = Object.freeze({
			details: freezeDetails(details),
			elapsedMs: elapsed(clock(), startedAt),
			stage: String(stage || 'unknown')
		});
		entries.push(entry);
		return entry;
	}
	function snapshot() {
		return Object.freeze(entries.slice());
	}
	function latest() {
		return entries.at(-1) || null;
	}
	return Object.freeze({ latest, mark, snapshot, startedAt });
}

function resolveClock(environment) {
	const performanceNow = environment?.performance?.now;
	if (typeof performanceNow === 'function') {
		return () => Number(performanceNow.call(environment.performance)) || 0;
	}
	const dateNow = environment?.Date?.now || Date.now;
	return () => Number(dateNow()) || 0;
}

function elapsed(current, startedAt) {
	return Math.max(0, Math.round((current - startedAt) * 1000) / 1000);
}

function freezeDetails(details) {
	if (!details || typeof details !== 'object') {
		return Object.freeze({ value: details ?? null });
	}
	return Object.freeze({ ...details });
}
