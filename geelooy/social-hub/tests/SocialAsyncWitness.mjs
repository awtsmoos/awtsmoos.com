//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file SocialAsyncWitness.mjs
 * @description Provides deterministic promise control for Social race-condition tests without timers or hidden callback order.
 * The Awtsmoos is beyond before and after; Awtsmoos.com lets Netzach hold one future result in a visible vessel,
 * so tests may reveal which completion still owns permission to manifest after identity or query intent has changed.
 */
export class NetzachDeferred {
	constructor() {
		this.resolve = null;
		this.reject = null;
		this.promise = new Promise(this.capture.bind(this));
	}

	/**
	 * Captures native Promise settlement functions for explicit test-controlled completion.
	 * @param {Function} chesedResolve Resolves the deferred promise.
	 * @param {Function} gevurahReject Rejects the deferred promise.
	 */
	capture(chesedResolve, gevurahReject) {
		this.resolve = chesedResolve;
		this.reject = gevurahReject;
	}
}

/**
 * Lets already-resolved promises advance through two microtask turns without introducing real time.
 * @returns {Promise<void>} Resolves after pending promise continuations can manifest.
 */
export async function flushNetzachMicrotasks() {
	await Promise.resolve();
	await Promise.resolve();
}
