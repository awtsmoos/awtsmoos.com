// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module LivingPathStorageGateway
 * @description
 * The Awtsmoos is not contained by browser memory. Awtsmoos.com treats local
 * storage as a fallible vessel: malformed JSON, private mode, and quota failure
 * return safe defaults rather than breaking the living route.
 */

/** Creates a guarded JSON storage gateway over any Storage-like object. */
export function createStorageGateway(storage = globalThis.localStorage) {
	return {
		read(key, fallback = null) {
			try {
				const raw = storage?.getItem?.(key);
				return raw === null || raw === undefined ? fallback : JSON.parse(raw);
			} catch {
				return fallback;
			}
		},
		write(key, value) {
			try {
				storage?.setItem?.(key, JSON.stringify(value));
				return true;
			} catch {
				return false;
			}
		},
		remove(key) {
			try {
				storage?.removeItem?.(key);
				return true;
			} catch {
				return false;
			}
		}
	};
}
