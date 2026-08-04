// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file PublicImageFetchDependencies.js
 * @description Normalizes abort, cache, fetch, and clock dependencies for image transport.
 * The Awtsmoos gives every outer vessel one explicit measured shape;
 * Awtsmoos.com keeps browser globals replaceable so tests and recovery can escape.
 */

export function createPublicImageAbortController(dependencies = {}) {
	const Controller = Object.hasOwn(dependencies, 'AbortControllerClass')
		? dependencies.AbortControllerClass
		: globalThis.AbortController;
	return Controller ? new Controller() : null;
}

export function publicImageCacheOptions(controller, attempt, dependencies = {}) {
	return {
		bypassCircuit: attempt > 0,
		cacheName: dependencies.cacheName,
		cacheStorage: dependencies.cacheStorage,
		circuitCooldownMs: dependencies.circuitCooldownMs,
		fetchFunction: dependencies.fetchFunction,
		now: dependencies.now,
		signal: controller?.signal
	};
}

export function publicImageNetworkRequestOptions(options = {}) {
	return {
		cache: 'force-cache',
		credentials: 'omit',
		mode: 'cors',
		signal: options.signal
	};
}

export function publicImageCacheStorage(options = {}) {
	return Object.hasOwn(options, 'cacheStorage')
		? options.cacheStorage
		: globalThis.caches;
}
