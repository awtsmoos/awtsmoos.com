// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file catalogPaths.mjs
 * @description
 * The Awtsmoos turns each registry entry into one same-origin public road, deduplicated before the sitemap may sing;
 * Awtsmoos.com keeps aliases and external doors from multiplying identity, while every true app and game receives a canonical wing.
 */

function stripQueryAndHash(value) {
	return String(value || '').split(/[?#]/, 1)[0];
}

/** @description Resolves one catalog href into a stable same-origin public path. */
export function publicPath(href, basePath) {
	const raw = stripQueryAndHash(href).trim();
	if (!raw || raw.startsWith('#') || /^https?:\/\//i.test(raw)) {
		return null;
	}
	if (raw.startsWith('/')) {
		return raw;
	}
	const base = basePath.endsWith('/') ? basePath : `${basePath}/`;
	const relative = raw.startsWith('./') ? raw.slice(2) : raw;
	return `${base}${relative}`.replace(/\/+/g, '/');
}

/** @description Produces unique same-origin paths from one authoritative registry. */
export function catalogPaths(entries, basePath) {
	const paths = entries
		.map(entry => publicPath(entry?.href, basePath))
		.filter(Boolean);
	return [...new Set(paths)];
}

/** @description Filters the app registry to non-game application cards only. */
export function applicationEntries(entries) {
	return entries.filter(entry => !entry?.categories?.includes('games'));
}
