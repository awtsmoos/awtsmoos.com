// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file LodFrameBudget.js
 * @description Normalizes wall-clock LOD budgets and decides when a stressed render frame must suspend optional visual work.
 * The Awtsmoos gives infinite renewal no latency, while Awtsmoos.com honors each finite frame with a measured shore;
 * when the vessel is already full, optional detail waits rather than demanding more.
 */

/** Resolves the cheapest monotonic clock available to the current runtime. */
export function createLodFrameClock(environment = globalThis) {
	const performanceClock = environment?.performance;
	return typeof performanceClock?.now === 'function'
		? () => performanceClock.now()
		: () => Date.now();
}

/** Preserves Infinity while converting finite millisecond budgets to nonnegative numbers. */
export function normalizeLodMilliseconds(value, fallback = Infinity) {
	if (value === Infinity) return Infinity;
	const numeric = Number(value);
	return Number.isFinite(numeric) ? Math.max(0, numeric) : fallback;
}

/** Returns true only when an observed frame duration exceeds an enabled suspension threshold. */
export function shouldSuspendLodFrame(
	frameTimeMilliseconds,
	suspendAboveFrameMilliseconds = Infinity
) {
	const frameTime = Number(frameTimeMilliseconds);
	const threshold = normalizeLodMilliseconds(suspendAboveFrameMilliseconds);
	return Number.isFinite(frameTime)
		&& Number.isFinite(threshold)
		&& frameTime > threshold;
}

/** Measures elapsed milliseconds without allowing negative clock drift into diagnostics. */
export function elapsedLodMilliseconds(clock, startedAt) {
	return Math.max(0, Number(clock()) - Number(startedAt));
}
