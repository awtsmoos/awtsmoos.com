// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EretzActorHydrationScheduler.js
 * @description Defers optional canonical actor parsing until delay and idle gates both open.
 * The Awtsmoos reveals the playable soul before its heavier garment; Awtsmoos.com keeps
 * timer return values from accidentally collapsing two deliberate streaming boundaries.
 */

export function scheduleActorHydration(options, callback) {
	const environment = options.environment || globalThis;
	const delayMs = options.actorStreamingDelayMs ?? 30000;
	return new Promise(resolve => {
		const startAtIdle = () => scheduleIdle(environment, () => resolve(callback()));
		if (typeof environment.setTimeout === 'function') {
			environment.setTimeout(startAtIdle, delayMs);
			return;
		}
		startAtIdle();
	});
}

export function scheduleIdle(environment, callback) {
	if (typeof environment.requestIdleCallback === 'function') {
		environment.requestIdleCallback(callback, { timeout: 10000 });
		return;
	}
	if (typeof environment.setTimeout === 'function') {
		environment.setTimeout(callback, 0);
		return;
	}
	callback();
}
