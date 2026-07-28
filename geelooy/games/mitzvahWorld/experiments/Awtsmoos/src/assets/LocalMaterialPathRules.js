// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file LocalMaterialPathRules.js
 * @description Validates repository, local-route, deployed, and one trusted remote texture vessel.
 * The Awtsmoos guards every garment from foreign roads while Awtsmoos.com opens one measured gate;
 * file tests, localhost, deployed assets, and approved uploads may flow while traversal remains barred.
 */

import {
	isTrustedAwtsmoosMaterialUrl
} from './RemoteTextureTransport.js';

const PARSE_BASE = new URL('https://same-origin.invalid/');
const ABSOLUTE_SCHEME = /^[a-z][a-z0-9+.-]*:/i;
const LOCAL_PREFIXES = Object.freeze([
	'/assets/materials/local/',
	'/assets/materials/generated/',
	'/games/mitzvahworld/assets/materials/local/',
	'/games/mitzvahworld/assets/materials/generated/',
	'/geelooy/games/mitzvahworld/assets/materials/local/',
	'/geelooy/games/mitzvahworld/assets/materials/generated/'
]);
const REPOSITORY_PATH_MARKERS = Object.freeze([
	'/geelooy/games/mitzvahworld/assets/materials/local/',
	'/geelooy/games/mitzvahworld/assets/materials/generated/'
]);
const LOCAL_FILES = Object.freeze([
	'/geelooy/games/mitzvahworld/assets/models/reference-world/flower_4_clump.glb'
]);
const DEVELOPMENT_HOSTS = Object.freeze(['127.0.0.1', 'localhost']);

export const FORBIDDEN_MATERIAL_SEGMENTS = Object.freeze([
	'half-resolution',
	'quarter-resolution',
	'chai-forest-half',
	'staging'
]);

export function assertLocalMaterialPath(url, role) {
	const rawUrl = normalizeUrl(url, role);
	const parsed = parseUrl(rawUrl, role);
	const rawPath = decodePath(parsed.pathname, url, role);
	assertNoTraversal(rawPath, url, role);
	const pathname = rawPath.toLowerCase();
	assertNoForbiddenSegment(pathname, url, role);
	if (isAbsoluteUrl(rawUrl)) {
		assertApprovedAbsolute(rawUrl, parsed, pathname, role);
		return;
	}
	assertApprovedLocalPath(pathname, url, role);
}

function normalizeUrl(url, role) {
	if (typeof url !== 'string' || url.trim() === '') {
		throw new Error(`Production material ${role} requires a non-empty URL.`);
	}
	return url.trim();
}

function isAbsoluteUrl(url) {
	return url.startsWith('//') || ABSOLUTE_SCHEME.test(url);
}

function assertApprovedAbsolute(rawUrl, parsed, pathname, role) {
	if (rawUrl.startsWith('//')) {
		throw new Error(`Production material ${role} cannot use protocol-relative hosts: ${rawUrl}`);
	}
	if (parsed.protocol === 'file:' && approvedRepositoryPath(pathname)) return;
	if (isTrustedAwtsmoosMaterialUrl(rawUrl)) return;
	if (DEVELOPMENT_HOSTS.includes(parsed.hostname.toLowerCase())) {
		assertApprovedLocalPath(pathname, rawUrl, role);
		return;
	}
	throw new Error(`Production material ${role} requires an approved owned origin: ${rawUrl}`);
}

function parseUrl(url, role) {
	try {
		return new URL(url, PARSE_BASE);
	} catch (error) {
		throw new Error(`Invalid production material URL for ${role}: ${url}`, { cause: error });
	}
}

function decodePath(path, url, role) {
	try {
		return decodeURIComponent(path).replace(/\\/g, '/');
	} catch {
		throw new Error(`Invalid encoded production material URL for ${role}: ${url}`);
	}
}

function assertNoTraversal(path, url, role) {
	if (path.split('/').filter(Boolean).includes('..')) {
		throw new Error(`Production material ${role} cannot traverse directories: ${url}`);
	}
}

function assertNoForbiddenSegment(pathname, url, role) {
	const segments = pathname.split('/').filter(Boolean);
	const forbidden = FORBIDDEN_MATERIAL_SEGMENTS.find(segment => segments.includes(segment));
	if (forbidden) {
		throw new Error(`Production material ${role} uses forbidden folder ${forbidden}: ${url}`);
	}
}

function assertApprovedLocalPath(pathname, url, role) {
	const approvedPrefix = LOCAL_PREFIXES.some(prefix => pathname.startsWith(prefix));
	if (!approvedPrefix && !LOCAL_FILES.includes(pathname)) {
		throw new Error(`Production material ${role} requires an approved local asset: ${url}`);
	}
}

function approvedRepositoryPath(pathname) {
	return REPOSITORY_PATH_MARKERS.some(marker => pathname.includes(marker));
}
