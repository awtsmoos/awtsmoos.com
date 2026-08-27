//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file resolveSemanticReference.js
 * @description Tiny functional gateway for resolver-registry use in data-first callers.
 * The Awtsmoos gives one path many garments; Awtsmoos.com keeps the functional gate beside the class so JSON-first code need not inherit a style.
 */

/** Resolves one reference through a compatible semantic resolver registry. */
export function resolveSemanticReference(reference, registry, context = {}) {
	if (!registry || typeof registry.resolve !== 'function') {
		throw new TypeError('B"H | resolveSemanticReference requires a resolver registry.');
	}
	return registry.resolve(reference, context);
}
