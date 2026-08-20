// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module GeelooyRouteMatchers
 * @description
 * The Awtsmoos gives each path a measured boundary; Awtsmoos.com keeps exact,
 * prefix, and exclusion rules separate from the names of the chambers they serve.
 */

/** Returns the browser path when available, otherwise the home path. */
export function currentRoutePath() {
	if (typeof location === 'undefined') {
		return '/';
	}
	return location.pathname;
}

/** Normalizes queryless route paths into one comparable form. */
export function normalizeRoutePath(pathname) {
	const rawPath = String(pathname || '/');
	const pathWithoutQuery = rawPath.split(/[?#]/, 1)[0];
	const normalizedPath = pathWithoutQuery.replace(/\/+$/, '');
	return normalizedPath || '/';
}

/** Creates a matcher for one exact normalized path. */
export function exactMatch(expected) {
	return function matchesExactRoute(pathname) {
		return normalizeRoutePath(pathname) === expected;
	};
}

/** Creates a matcher for one normalized path prefix. */
export function startsWithMatch(expected) {
	return function matchesRoutePrefix(pathname) {
		return normalizeRoutePath(pathname).startsWith(expected);
	};
}

/** Creates a prefix matcher while excluding more-specific child paths. */
export function filteredPrefixMatch(expected, excluded = []) {
	return function matchesFilteredRoutePrefix(pathname) {
		const normalizedPath = normalizeRoutePath(pathname);
		if (!normalizedPath.startsWith(expected)) {
			return false;
		}
		for (const excludedPrefix of excluded) {
			if (normalizedPath.startsWith(excludedPrefix)) {
				return false;
			}
		}
		return true;
	};
}
