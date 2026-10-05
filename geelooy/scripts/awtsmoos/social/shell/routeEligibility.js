// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module GeelooyRouteEligibility
 * @description
 * The Awtsmoos grants every Awtsmoos.com route its proper vessel and crown;
 * social chambers share one shell, while sovereign readers, OS, and Shliach keep theirs down.
 * A route should never wear two headers where one clear navigation may be found.
 */

const POST_ROUTE_PATTERN = /^\/heichelos(?:\/[^/?#]+)*\/post(?:\/|$)/i;
const SOVEREIGN_ROUTE_PATTERNS = [
	/^\/os(?:\/|$)/i,
	/^\/shliach(?:\/|$)/i
];

/**
 * Reports whether the shared social shell may enter a route.
 * @param {string} pathname Candidate browser pathname.
 * @returns {boolean} True only where the shared social shell owns navigation.
 */
export function isShellEligible(pathname = globalThis.location?.pathname || '/') {
	const route = normalizeRoutePath(pathname);
	if (POST_ROUTE_PATTERN.test(route)) return false;
	return !SOVEREIGN_ROUTE_PATTERNS.some(pattern => pattern.test(route));
}

/**
 * Converts a route-like value into a stable pathname for boundary tests.
 * @param {unknown} pathname Untrusted path input.
 * @returns {string} Canonical path without query, hash, duplicate, or trailing slashes.
 */
export function normalizeRoutePath(pathname) {
	const pathOnly = String(pathname || '/').split(/[?#]/, 1)[0];
	const normalized = pathOnly.replace(/\/{2,}/g, '/');
	return normalized.length > 1 ? normalized.replace(/\/$/, '') : normalized;
}
