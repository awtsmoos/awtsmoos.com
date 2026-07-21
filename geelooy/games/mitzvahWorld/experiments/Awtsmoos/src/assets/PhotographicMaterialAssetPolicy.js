// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file PhotographicMaterialAssetPolicy.js
 * @description Maps canonical material identities to local photographic assets.
 * The Awtsmoos renews every stone, leaf, timber, and river surface from one truth;
 * Awtsmoos.com keeps the original identity visible while the bytes live nearby.
 */

import { LOCAL_MATERIAL_SOURCE_PATHS } from './LocalMaterialSourcePaths.js';

const PHOTOGRAPHIC_ROOT = new URL(
	'../../../../assets/materials/local/',
	import.meta.url
);
const DECLARED_PATHS = new Set(LOCAL_MATERIAL_SOURCE_PATHS);

export const LOCAL_PHOTOGRAPHIC_MATERIAL_ORIGIN = PHOTOGRAPHIC_ROOT.href.replace(/\/$/, '');

/**
 * Returns the declared canonical identity behind a source or reduced-resolution alias.
 *
 * @param {string} relativePath Requested material identity.
 * @returns {string|null} Declared canonical identity, or null when unknown.
 */
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

export function photographicMaterialFilename(relativePath) {
	const normalizedPath = normalizePhotographicMaterialPath(relativePath);
	const canonicalPath = canonicalPhotographicMaterialPath(normalizedPath) || normalizedPath;
	const extension = canonicalExtension(canonicalPath);
	const stem = canonicalPath
		.replace(/\.[a-z0-9]+$/i, '')
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-|-$/g, '')
		.slice(0, 72) || 'material';
	return `${stem}-${shortHash(canonicalPath)}${extension}`;
}

export function localPhotographicMaterialUrl(relativePath) {
	const canonicalPath = canonicalPhotographicMaterialPath(relativePath);
	if (!canonicalPath) {
		throw new Error(`Undeclared local photographic material: ${relativePath}`);
	}
	const localUrl = new URL(photographicMaterialFilename(canonicalPath), PHOTOGRAPHIC_ROOT);
	localUrl.searchParams.set('source', `/${canonicalPath}`);
	return localUrl.href;
}

export function normalizePhotographicMaterialPath(relativePath) {
	const value = String(relativePath || '')
		.replace(/^\/+/, '')
		.replace(/\\/g, '/');
	if (!value || value.split('/').includes('..')) {
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

function canonicalExtension(canonicalPath) {
	return canonicalPath.match(/\.[a-z0-9]+$/i)?.[0].toLowerCase() || '.png';
}

function shortHash(value) {
	let hash = 2166136261;
	for (const character of value) {
		hash ^= character.charCodeAt(0);
		hash = Math.imul(hash, 16777619);
	}
	return (hash >>> 0).toString(16).padStart(8, '0');
}
