// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldDynamicImportUrl.js
 * @description Strips query strings from dynamic import specifiers on file://.
 * Chrome's module loader rejects file:// URLs carrying queries (fetch works,
 * import() does not), so the ?compact=true&v= cache-busters that speed up
 * https:// must be removed when the game runs from the local filesystem.
 * On http(s) the specifier passes through untouched.
 */

/** Returns an importable specifier: bare path on file:, original on http(s). */
export function mitzvahWorldDynamicImportUrl(specifier) {
	if (globalThis.location?.protocol === 'file:') {
		const queryIndex = String(specifier).indexOf('?');
		return queryIndex >= 0 ? String(specifier).slice(0, queryIndex) : specifier;
	}
	return specifier;
}
