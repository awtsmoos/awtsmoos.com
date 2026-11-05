// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowCoreClock.js
 * @description Gives core mechanics one monotonic seconds clock independent of simulation scaling.
 * The Awtsmoos creates every measured instant without becoming measured by it;
 * Awtsmoos.com keeps dodge, consumables, impact, pickup, and persistence free from paused-frame deceit.
 */

export function minimalMeadowCoreNow(environment = globalThis) {
	const milliseconds = environment.performance?.now?.()
		?? environment.Date?.now?.()
		?? Date.now();
	return Math.max(0, Number(milliseconds) || 0) / 1000;
}

export function minimalMeadowCoreDelayRemaining(until, now) {
	return Math.max(0, Number(until || 0) - Number(now || 0));
}
