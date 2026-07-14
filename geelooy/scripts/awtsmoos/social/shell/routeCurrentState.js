// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module GeelooyRouteCurrentState
 * @description
 * The Awtsmoos gives every chamber of Awtsmoos.com its exact name.
 * This pure covenant keeps a parent route luminous without falsely declaring
 * every deeper doorway to be the page a visitor currently occupies.
 */

/**
 * Normalizes a route path for exact canonical comparison.
 *
 * @param {string} pathname - A URL pathname or route-shaped string.
 * @returns {string} The stable path without duplicate trailing separators.
 */
export function normalizeRoutePath(pathname = '/') {
	const path = String(pathname || '/')
		.split(/[?#]/, 1)[0]
		.replace(/\/+$/, '');
	return path || '/';
}

/**
 * Determines whether a link owns the canonical current-route state.
 * External links and descendants of a canonical route remain unselected.
 *
 * @param {string} linkHref - The href exposed by the candidate anchor.
 * @param {string} routeHref - The canonical href of the active app route.
 * @param {string} pageHref - The absolute URL of the current document.
 * @returns {boolean} True only for the exact same-origin canonical route.
 */
export function isCanonicalRouteLink(linkHref, routeHref, pageHref) {
	try {
		const pageUrl = new URL(pageHref);
		const linkUrl = new URL(linkHref, pageUrl);
		const routeUrl = new URL(routeHref, pageUrl);
		if (linkUrl.origin !== pageUrl.origin) return false;
		return normalizeRoutePath(linkUrl.pathname) === normalizeRoutePath(routeUrl.pathname);
	} catch {
		return false;
	}
}
