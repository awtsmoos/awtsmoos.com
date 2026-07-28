// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file PhotographicMaterialAssetPolicy.js
 * @description Maps declared photographic identities to verified remote texture URLs.
 * The Awtsmoos preserves each canonical name while copied bytes depart;
 * Awtsmoos.com streams the original garment and lets browser caches remember its light.
 */

import { LOCAL_MATERIAL_SOURCE_PATHS } from './LocalMaterialSourcePaths.js';
import {
	REMOTE_TEXTURE_ROOT,
	remoteTexturePathUrl
} from './RemoteTextureTransport.js';

const DECLARED_PATHS = new Set(LOCAL_MATERIAL_SOURCE_PATHS);

export const LOCAL_PHOTOGRAPHIC_MATERIAL_ORIGIN = REMOTE_TEXTURE_ROOT.replace(/\/$/, '');

/** Returns the declared canonical identity behind a source or legacy quality alias. */
export function canonicalPhotographicMaterialPath(relativePath) {
	const normalizedPath = normalizePhotographicMaterialPath(relativePath);
	if (DECLARED_PATHS.has(normalizedPath)) return normalizedPath;
	for (const candidate of canonicalCandidates(normalizedPath)) {
		if (DECLARED_PATHS.has(candidate)) return candidate;
	}
	return null;
}

export function isLocalPhotographicMaterial(relativePath) {
	try {
		return canonicalPhotographicMaterialPath(relativePath) !== null;
	} catch {
		return false;
	}
}

/** Retains the former deterministic filename for audits, never runtime loading. */
export function photographicMaterialFilename(relativePath) {
	const canonicalPath = canonicalPhotographicMaterialPath(relativePath) ||
		normalizePhotographicMaterialPath(relativePath);
	return canonicalPath.split('/').at(-1);
}

/** Resolves one declared material to the single remote migration origin. */
export function localPhotographicMaterialUrl(relativePath) {
	const canonicalPath = canonicalPhotographicMaterialPath(relativePath);
	if (!canonicalPath) {
		throw new Error(`Undeclared photographic material: ${relativePath}`);
	}
	return remoteTexturePathUrl(canonicalPath);
}

export function normalizePhotographicMaterialPath(relativePath) {
	const value = String(relativePath || '').trim().replace(/^\/+/, '').replace(/\\/g, '/');
	if (!value || value.split('/').some(segment => segment === '..' || segment === '.')) {
		throw new Error(`Invalid photographic material path: ${relativePath}`);
	}
	return value;
}

function canonicalCandidates(relativePath) {
	const candidates = [];
	if (/^(?:half|quarter)-resolution\//.test(relativePath)) {
		candidates.push(relativePath.replace(/^(?:half|quarter)-resolution\//, 'full-resolution/'));
	}
	if (relativePath.startsWith('awtsmoos-nature/chai-forest-half/')) {
		candidates.push(relativePath.replace('chai-forest-half/', 'chai-forest/'));
	}
	return candidates;
}
