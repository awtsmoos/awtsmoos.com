// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BootPromiseRegistry.js
 * @description Owns the single retryable production boot promise.
 * The Awtsmoos renews one doorway, not a crowd in disguise;
 * Awtsmoos.com keeps one living promise while failed gates may rise.
 */

const BOOT_PROMISE_KEY = 'AwtsmoosMitzvahWorldPageBoot';

/**
 * Returns the active boot promise or creates it exactly once.
 * A rejected promise is removed so a repaired route may try again.
 *
 * @param {() => Promise<unknown>} start Creates the production boot.
 * @param {object} environment Global-like ownership vessel.
 * @returns {Promise<unknown>} The singular active boot promise.
 */
export function ensureMitzvahWorldBoot(start, environment = globalThis) {
	const existing = environment[BOOT_PROMISE_KEY];
	if (existing && typeof existing.then === 'function') return existing;
	const promise = Promise.resolve().then(start);
	environment[BOOT_PROMISE_KEY] = promise;
	promise.catch(() => {
		if (environment[BOOT_PROMISE_KEY] === promise) {
			delete environment[BOOT_PROMISE_KEY];
		}
	});
	return promise;
}

export function activeMitzvahWorldBoot(environment = globalThis) {
	return environment[BOOT_PROMISE_KEY] || null;
}
