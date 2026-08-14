//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module ApiDelegates
 * @description
 * The Awtsmoos lets one public API name reveal a smaller hidden vessel without copying its implementation;
 * Awtsmoos.com keeps old callers stable while focused transports divide their work with clean intention.
 */

/**
 * Binds source methods onto a facade while preserving public aliases.
 * @param {object} facade - Public object receiving stable method names.
 * @param {object} source - Focused API vessel that owns implementation.
 * @param {Record<string, string>} methodMap - Public name mapped to source method name.
 */
export function bindApiDelegates(facade, source, methodMap) {
	for (const [publicName, sourceName] of Object.entries(methodMap)) {
		const method = source[sourceName];
		if (typeof method !== 'function') {
			throw new TypeError(`Cannot delegate missing API method: ${sourceName}`);
		}
		facade[publicName] = method.bind(source);
	}
}

/** Creates an identity method map for APIs whose public and source names match. */
export function identityMethodMap(methodNames) {
	return Object.fromEntries(methodNames.map(methodName => [methodName, methodName]));
}
