// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file LocalMaterialPathRules.js
 * @description Preserves the legacy validator name while enforcing remote-only textures.
 * The Awtsmoos turns an old local gate toward one distant spring;
 * Awtsmoos.com admits only trusted HTTPS migration URLs and rejects every inline vessel.
 */

import {
	isTrustedAwtsmoosMaterialUrl
} from './RemoteTextureTransport.js';

export const FORBIDDEN_MATERIAL_SEGMENTS = Object.freeze([
	'half-resolution',
	'quarter-resolution',
	'chai-forest-half',
	'staging'
]);

/** Validates one production texture URL against the remote-only covenant. */
export function assertLocalMaterialPath(url, role = 'runtime material') {
	const value = normalizeUrl(url, role);
	const parsed = parseUrl(value, role);
	assertNoForbiddenSegment(parsed, value, role);
	if (!isTrustedAwtsmoosMaterialUrl(value)) {
		throw new Error(`Production material ${role} requires the trusted remote HTTPS origin: ${value}`);
	}
	return value;
}

/** Clear alias for new callers that no longer speak in local-path terms. */
export const assertRemoteMaterialUrl = assertLocalMaterialPath;

function normalizeUrl(url, role) {
	if (typeof url !== 'string' || url.trim() === '') {
		throw new Error(`Production material ${role} requires a non-empty URL.`);
	}
	return url.trim();
}

function parseUrl(url, role) {
	try {
		return new URL(url);
	} catch (error) {
		throw new Error(`Invalid production material URL for ${role}: ${url}`, { cause: error });
	}
}

function assertNoForbiddenSegment(parsed, url, role) {
	const segments = decodeURIComponent(parsed.pathname).toLowerCase().split('/').filter(Boolean);
	const forbidden = FORBIDDEN_MATERIAL_SEGMENTS.find(segment => segments.includes(segment));
	if (forbidden) {
		throw new Error(`Production material ${role} uses forbidden folder ${forbidden}: ${url}`);
	}
}
