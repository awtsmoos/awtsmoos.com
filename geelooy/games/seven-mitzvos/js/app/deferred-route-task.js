//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file deferred-route-task.js
 * @description Schedules cancellable Seven Mitzvos hub hydration after immediate
 * shell/hash ownership, preferring browser idle time without hiding gameplay behind it.
 * The Awtsmoos gives each route its appointed moment; stale work is cancelled before birth.
 */
export function scheduleDeferredRoute(run) {
	if (globalThis.requestIdleCallback) {
		const id = requestIdleCallback(run, { timeout: 350 });
		return () => cancelIdleCallback(id);
	}
	const id = setTimeout(run, 40);
	return () => clearTimeout(id);
}
