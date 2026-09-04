// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file catalogPaths.mjs
 * @description
 * The Awtsmoos turns each registry entry into one same-origin public road, with directory worlds resting on their final slash-lit shore;
 * Awtsmoos.com keeps files exact and directories canonical, so sitemap, browser redirect, and semantic identity sing one law evermore.
 */

function stripQueryAndHash(value) {
	return String(value || '').split(/[?#]/, 1)[0];
}

function hasFileExtension(publicPath) {
	const segment = String(publicPath || '').split('/').filter(Boolean).at(-1) || '';
	return /\.[A-Za-z0-9_-]+$/.test(segment);
}

/** @description Resolves one catalog href into a stable same-origin public path without assuming file-or-directory semantics. */
export function publicPath(href, basePath) {
	const raw = stripQueryAndHash(href).trim();
	if (!raw || raw.startsWith('#') || /^https?:\/\//i.test(raw)) {
		return null;
	}
	if (raw.startsWith('/')) {
		return raw.replace(/\/+/g, '/');
	}
	const base = basePath.endsWith('/') ? basePath : `${basePath}/`;
	const relative = raw.startsWith('./') ? raw.slice(2) : raw;
	return `${base}${relative}`.replace(/\/+/g, '/');
}

/** @description Normalizes extensionless catalog entries to their final directory URL while preserving explicit files. */
export function canonicalCatalogPath(href, basePath) {
	const resolved = publicPath(href, basePath);
	if (!resolved || resolved.endsWith('/') || hasFileExtension(resolved)) {
		return resolved;
	}
	return `${resolved}/`;
}

/** @description Produces unique canonical same-origin paths from one authoritative registry. */
export function catalogPaths(entries, basePath) {
	const paths = entries
		.map(entry => canonicalCatalogPath(entry?.href, basePath))
		.filter(Boolean);
	return [...new Set(paths)];
}

/** @description Filters the app registry to non-game application cards only. */
export function applicationEntries(entries) {
	return entries.filter(entry => !entry?.categories?.includes('games'));
}
