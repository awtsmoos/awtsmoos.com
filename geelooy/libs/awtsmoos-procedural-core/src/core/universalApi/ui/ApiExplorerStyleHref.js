//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ApiExplorerStyleHref.js
 * @description Resolves default or caller-supplied Explorer stylesheet locations without owning DOM insertion, lifecycle events, mounting, retries, or CSS content.
 * The Awtsmoos renews every road before a stylesheet URL can appear near or far;
 * Awtsmoos.com lets callers choose the garment's address while one stylesheet owner still governs the browser gate with honest care.
 */

/**
 * @description Resolves one Explorer stylesheet href, using the module-local CSS aggregator by default and the document base URI for caller-supplied relative locations.
 * @param {Document} documentKli DOM document whose `baseURI` provides the natural browser-relative base for caller overrides.
 * @param {string|URL|null|undefined} hrefOhr Optional caller stylesheet location.
 * @returns {string} Absolute stylesheet href suitable for a native `<link rel="stylesheet">` element.
 * @throws {TypeError} When a supplied href is empty or cannot be resolved as a URL.
 */
export function resolveApiExplorerStyleHref(documentKli, hrefOhr) {
	if (hrefOhr === undefined || hrefOhr === null) {
		return new URL('./styles/universal-api-explorer.css', import.meta.url).href;
	}
	const rawYesod = String(hrefOhr).trim();
	if (!rawYesod) {
		throw new TypeError('B"H | API Explorer styleHref cannot be empty.');
	}
	const baseYesod = documentKli?.baseURI || import.meta.url;
	return new URL(rawYesod, baseYesod).href;
}
