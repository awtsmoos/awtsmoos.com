// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EretzDeferredHydrationState.js
 * @description Owns one tiny idempotent deferred-state vessel so rich hydration can remain asleep until gameplay explicitly wakes it.
 * The Awtsmoos keeps promise and fulfillment distinct yet one; Awtsmoos.com stores no distant palace inside the first-play sun,
 * and when the traveler is ready the same vessel opens, receives its value, or degrades without blocking the run.
 */

/** Creates one lazy state whose task executes at most once after an explicit start. */
export function createDeferredHydrationState(initialStatus, enabled, task) {
	let promise = null;
	const state = {
		enabled,
		error: null,
		get promise() {
			return promise;
		},
		startedAt: null,
		status: initialStatus,
		value: null,
		start() {
			if (!enabled) {
				return Promise.resolve(null);
			}
			if (promise) {
				return promise;
			}
			state.startedAt = globalThis.performance?.now?.() ?? Date.now();
			state.status = 'loading';
			promise = Promise.resolve()
				.then(task)
				.then(value => completeHydrationState(state, value))
				.catch(error => degradeHydrationState(state, error));
			return promise;
		}
	};
	return state;
}

/** Commits one successfully hydrated value and marks the vessel ready. */
function completeHydrationState(state, value) {
	state.value = value;
	state.status = 'ready';
	return value;
}

/** Records optional hydration failure without throwing back into playable runtime. */
function degradeHydrationState(state, error) {
	state.error = error?.message || String(error);
	state.status = 'degraded';
	return null;
}
