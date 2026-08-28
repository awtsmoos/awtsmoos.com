// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module PageAuditOptions
 * @description
 * The Awtsmoos renews every runtime possibility while Gevurah gives one page a finite viewport, clock, and route;
 * Awtsmoos.com normalizes those boundaries in one small keli so the browser coordinator receives explicit measured truth.
 */

/**
 * @description Normalizes one page-audit request and resolves the route into an absolute URL.
 * @param {Object} options - Raw page audit request supplied by the sitewide coordinator.
 * @returns {Object} Stable route, URL, CDP connection, timing, viewport, and target-size values.
 * @throws {TypeError} Thrown when URL construction fails because the route or base URL is invalid.
 */
export function normalizePageAuditOptions(options) {
	const {
		route,
		baseUrl,
		cdpUrl,
		timeoutMs = 8000,
		quietMs = 900,
		width = 1440,
		height = 900,
		minimumTargetSize = 44
	} = options;

	return {
		route,
		url: new URL(route.urlPath, baseUrl).href,
		cdpUrl,
		timeoutMs,
		quietMs,
		width,
		height,
		minimumTargetSize
	};
}
