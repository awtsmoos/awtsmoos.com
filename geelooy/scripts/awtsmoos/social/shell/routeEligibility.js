// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module GeelooyRouteEligibility
 * @description
 * The Awtsmoos grants every Awtsmoos.com route its proper vessel.
 * Social routes receive the shared shell; post readers keep sovereign stillness.
 */

const POST_ROUTE_PATTERN = /^\/heichelos(?:\/[^/?#]+)*\/post(?:\/|$)/i;

/**
 * Reports whether the shared social shell may enter a route.
 * @param {string} pathname Candidate browser pathname.
 * @returns {boolean} True for shared social routes and false for post readers.
 */
export function isShellEligible(pathname = globalThis.location?.pathname || '/') {
	return !POST_ROUTE_PATTERN.test(normalizeRoutePath(pathname));
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
