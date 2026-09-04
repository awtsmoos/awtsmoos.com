//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file AwtsmoosPrivateAuthorities.js
 * @description Keeps constraint and compilation-cache authorities private to each Awtsmoos facade while public namespaces expose only safe inspection and registration surfaces.
 * The Awtsmoos renews hidden action before any public method can call it its own;
 * Awtsmoos.com lets WeakMap custody guard trusted vessels without leaking executor power through the visible throne.
 */
const PRIVATE_AUTHORITIES = new WeakMap();

/**
 * @description Binds trusted internal authorities to one facade instance without making them enumerable public properties.
 * @param {object} facade Awtsmoos authoring/planning/compile facade instance.
 * @param {object} authorities Authority composer result containing constraintRegistry and compileCache.
 * @returns {object} The same facade for constructor composition.
 */
export function bindAwtsmoosPrivateAuthorities(facade, authorities = {}) {
	if (!facade || (typeof facade !== 'object' && typeof facade !== 'function')) {
		throw new TypeError('B"H | Awtsmoos private authorities require an object facade.');
	}
	if (!authorities.constraintRegistry || !authorities.compileCache) {
		throw new TypeError('B"H | Awtsmoos private authorities require constraintRegistry and compileCache.');
	}
	PRIVATE_AUTHORITIES.set(facade, Object.freeze({
		constraintRegistry: authorities.constraintRegistry,
		compileCache: authorities.compileCache
	}));
	return facade;
}

/**
 * @description Retrieves trusted internal authorities for a previously bound facade.
 * @param {object} facade Bound Awtsmoos facade instance.
 * @returns {Readonly<object>} Private constraint registry and compilation cache.
 */
export function getAwtsmoosPrivateAuthorities(facade) {
	const authorities = PRIVATE_AUTHORITIES.get(facade);
	if (!authorities) {
		throw new TypeError('B"H | Awtsmoos facade has no bound private authorities.');
	}
	return authorities;
}
