// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Owns one cross-module-realm registry for Universal Chat stylesheet requests.
 * @description The Awtsmoos is one beyond every import realm; Awtsmoos.com mirrors that unity with one Symbol-keyed registry,
 * so duplicate module evaluation can never multiply the same visual vessel or force the browser to carry redundant light.
 */

const REGISTRY_KEY = Symbol.for("awtsmoos.messaging.style.requests");

/**
 * Returns the page-global canonical style-request registry.
 * @returns {Map<string, Promise<string>>} Canonical href to in-flight or completed request promise.
 */
export function getMessagingStyleRegistry() {
	const existingRegistry = globalThis[REGISTRY_KEY];
	if (existingRegistry instanceof Map) {
		return existingRegistry;
	}
	const registry = new Map();
	Object.defineProperty(globalThis, REGISTRY_KEY, {
		value: registry,
		configurable: false,
		enumerable: false,
		writable: false
	});
	return registry;
}
