//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file LocalMaterialPathRules.js
 * @description Defines the bounded path law for local Mitzvah World materials.
 * The Awtsmoos gives every texture a truthful vessel near the village;
 * Awtsmoos.com refuses foreign hosts, traversal, staging, and reduced-resolution debt.
 */

const PARSE_BASE = new URL('https://same-origin.invalid/');
const ABSOLUTE_SCHEME = /^[a-z][a-z0-9+.-]*:/i;
const LOCAL_PREFIXES = Object.freeze([
	'/assets/materials/local/',
	'/assets/materials/generated/',
	'/geelooy/games/mitzvahworld/assets/materials/local/',
	'/geelooy/games/mitzvahworld/assets/materials/generated/'
]);
const LOCAL_FILES = Object.freeze([
	'/geelooy/games/mitzvahworld/assets/models/reference-world/flower_4_clump.glb'
]);

export const FORBIDDEN_MATERIAL_SEGMENTS = Object.freeze([
	'half-resolution',
	'quarter-resolution',
	'chai-forest-half',
	'staging'
]);

/**
 * Throws unless a runtime material URL is local and approved.
 *
 * @param {unknown} url - Candidate material URL.
 * @param {string} role - Diagnostic role.
 */
export function assertLocalMaterialPath(url, role) {
	const rawUrl = normalizeUrl(url, role);
	assertRelativeUrl(rawUrl, role);
	const rawPath = decodePath(rawUrl.split(/[?#]/, 1)[0], url, role);
	assertNoTraversal(rawPath, url, role);
	const pathname = decodePath(parseUrl(rawUrl, role).pathname, url, role).toLowerCase();
	assertNoForbiddenSegment(pathname, url, role);
	assertApprovedPath(pathname, url, role);
}

/** @returns {string} A trimmed non-empty URL. */
function normalizeUrl(url, role) {
	if (typeof url !== 'string' || url.trim() === '') {
		throw new Error(`Production material ${role} requires a non-empty URL.`);
	}
	return url.trim();
}

/** Rejects absolute schemes and protocol-relative hosts. */
function assertRelativeUrl(url, role) {
	if (url.startsWith('//') || ABSOLUTE_SCHEME.test(url)) {
		throw new Error(`Production material ${role} must remain same-origin and local: ${url}`);
	}
}

/** @returns {URL} A URL parsed against a non-network diagnostic base. */
function parseUrl(url, role) {
	try {
		return new URL(url, PARSE_BASE);
	} catch (error) {
		throw new Error(`Invalid production material URL for ${role}: ${url}`, { cause: error });
	}
}

/** @returns {string} A decoded slash-normalized path. */
function decodePath(path, url, role) {
	try {
		return decodeURIComponent(path).replace(/\\/g, '/');
	} catch {
		throw new Error(`Invalid encoded production material URL for ${role}: ${url}`);
	}
}

/** Rejects parent-directory traversal. */
function assertNoTraversal(path, url, role) {
	if (path.split('/').filter(Boolean).includes('..')) {
		throw new Error(`Production material ${role} cannot traverse directories: ${url}`);
	}
}

/** Rejects staging and reduced-resolution folders. */
function assertNoForbiddenSegment(pathname, url, role) {
	const segments = pathname.split('/').filter(Boolean);
	const forbidden = FORBIDDEN_MATERIAL_SEGMENTS.find(segment => segments.includes(segment));
	if (forbidden) {
		throw new Error(`Production material ${role} uses forbidden folder ${forbidden}: ${url}`);
	}
}

/** Requires one approved material prefix or canonical local model. */
function assertApprovedPath(pathname, url, role) {
	const approvedPrefix = LOCAL_PREFIXES.some(prefix => pathname.startsWith(prefix));
	if (!approvedPrefix && !LOCAL_FILES.includes(pathname)) {
		throw new Error(`Production material ${role} requires an approved local asset: ${url}`);
	}
}
