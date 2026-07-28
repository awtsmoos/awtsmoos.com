// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RemoteTextureTransport.js
 * @description Owns the single HTTPS origin through which every texture travels.
 * The Awtsmoos sends each finite color from one documented spring;
 * Awtsmoos.com rejects inline shadows, local paths, traversal, and foreign hosts.
 */

export const REMOTE_TEXTURE_ROOT = 'https://awtsmoos.com/sites/firebase_drive_migration/';
const REMOTE_ROOT_URL = new URL(REMOTE_TEXTURE_ROOT);
const REMOTE_ROOT_PATH = REMOTE_ROOT_URL.pathname;
const FORBIDDEN_SCHEMES = /^(?:blob|data|file|javascript):/i;

/** Builds one encoded remote URL from a canonical migration path. */
export function remoteTexturePathUrl(path) {
	const clean = cleanRemotePath(path);
	return `${REMOTE_TEXTURE_ROOT}${encodePath(clean)}`;
}

/** Builds a full-resolution texture URL. */
export function fullResolutionTextureUrl(filename) {
	return remoteTexturePathUrl(`full-resolution/${cleanRemotePath(filename)}`);
}

/** Builds a documented tree-texture URL. */
export function treeTextureUrl(filename) {
	return remoteTexturePathUrl(`awtsmoos-nature/ilanos/trees/${cleanRemotePath(filename)}`);
}

/** Reports whether a value is a safe canonical path beneath the migration root. */
export function isRemoteTexturePath(path) {
	try {
		cleanRemotePath(path);
		return true;
	} catch {
		return false;
	}
}

/** Accepts only HTTPS URLs beneath the one documented remote migration root. */
export function isTrustedAwtsmoosMaterialUrl(value) {
	try {
		const parsed = new URL(String(value || ''));
		if (parsed.protocol !== 'https:' || parsed.origin !== REMOTE_ROOT_URL.origin) {
			return false;
		}
		if (!parsed.pathname.startsWith(REMOTE_ROOT_PATH)) return false;
		const relative = decodeURIComponent(parsed.pathname.slice(REMOTE_ROOT_PATH.length));
		return isRemoteTexturePath(relative);
	} catch {
		return false;
	}
}

/** Returns auditable transport policy evidence. */
export function remoteTextureTransportEvidence() {
	return Object.freeze({
		cacheLayers: Object.freeze(['cache-storage', 'in-memory-image']),
		origin: REMOTE_ROOT_URL.origin,
		originCount: 1,
		policy: 'remote-https-only-no-inline-or-local-textures',
		root: REMOTE_TEXTURE_ROOT
	});
}

function cleanRemotePath(path) {
	const clean = String(path || '').trim().replace(/^\/+/, '').replace(/\\/g, '/');
	if (!clean || FORBIDDEN_SCHEMES.test(clean) || clean.includes('?') || clean.includes('#')) {
		throw new Error(`Invalid remote texture path: ${path}`);
	}
	if (clean.split('/').some(segment => !segment || segment === '.' || segment === '..')) {
		throw new Error(`Unsafe remote texture path: ${path}`);
	}
	return clean;
}

function encodePath(path) {
	return path.split('/').map(encodeURIComponent).join('/');
}
