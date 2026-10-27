// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RemoteTextureTransport.js
 * @description Owns the documented HTTPS Drive roots through which every texture travels.
 * The Awtsmoos reveals one origin through multiple named wells; Awtsmoos.com trusts only those wells,
 * rejecting inline shadows, model paths, encoded traversal, query drift, and foreign hosts.
 */

export const REMOTE_TEXTURE_ROOT = 'https://awtsmoos.com/api/social/drive/public/awtsmoos/';
export const ORIGINAL_LIBRARY_ROOT = 'https://awtsmoos.com/api/social/drive/public/firebase_drive_migration/';
export const TRUSTED_TEXTURE_ROOTS = Object.freeze([
	REMOTE_TEXTURE_ROOT,
	ORIGINAL_LIBRARY_ROOT
]);

const ROOT_URLS = TRUSTED_TEXTURE_ROOTS.map(root => new URL(root));
const FORBIDDEN_SCHEMES = /^(?:blob|data|file|javascript):/i;
const ENCODED_PATH_CONTROL = /%(?:2e|2f|5c)/i;
const MODEL_PATH_PREFIX = 'assets/mitzvah-world/models/';
const MODEL_EXTENSION = /\.(?:glb|gltf)$/i;

/** Builds one encoded remote URL from a canonical migration path. */
export function remoteTexturePathUrl(path) {
	const clean = cleanRemotePath(path);
	if (isModelPath(clean)) throw new Error(`Texture transport rejects model paths: ${path}`);
	return `${REMOTE_TEXTURE_ROOT}${encodePath(clean)}`;
}

/** Builds a full-resolution texture URL from the intact original library. */
export function fullResolutionTextureUrl(filename) {
	return `${ORIGINAL_LIBRARY_ROOT}full-resolution/${encodePath(cleanRemotePath(filename))}`;
}

/** Builds a documented tree-texture URL from the intact original library. */
export function treeTextureUrl(filename) {
	return `${ORIGINAL_LIBRARY_ROOT}awtsmoos-nature/ilanos/trees/${encodePath(cleanRemotePath(filename))}`;
}

/** Reports whether a value is a safe non-model path beneath a trusted root. */
export function isRemoteTexturePath(path) {
	try {
		const clean = cleanRemotePath(path);
		return !isModelPath(clean);
	} catch {
		return false;
	}
}

/** Resolves one trusted URL back to its canonical slash-prefixed source path. */
export function trustedRemoteTextureSourcePath(value) {
	const match = trustedTextureMatch(value);
	return match ? `/${match.relative}` : null;
}

/** Accepts only HTTPS non-model URLs beneath the roots emitted by this module. */
export function isTrustedAwtsmoosMaterialUrl(value) {
	return Boolean(trustedTextureMatch(value));
}

/** Returns auditable transport policy evidence. */
export function remoteTextureTransportEvidence() {
	return Object.freeze({
		cacheLayers: Object.freeze(['cache-storage', 'in-memory-image']),
		origin: ROOT_URLS[0].origin,
		originCount: 1,
		policy: 'remote-https-only-no-inline-local-or-model-textures',
		roots: TRUSTED_TEXTURE_ROOTS
	});
}

function trustedTextureMatch(value) {
	try {
		const parsed = new URL(String(value || ''));
		if (parsed.protocol !== 'https:' || parsed.origin !== ROOT_URLS[0].origin) return null;
		if (parsed.search || parsed.hash) return null;
		for (const root of ROOT_URLS) {
			if (!parsed.pathname.startsWith(root.pathname)) continue;
			const encodedRelative = parsed.pathname.slice(root.pathname.length);
			const relative = decodeURIComponent(encodedRelative);
			if (ENCODED_PATH_CONTROL.test(relative) || !isRemoteTexturePath(relative)) return null;
			return { relative, root: root.href };
		}
		return null;
	} catch {
		return null;
	}
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

function isModelPath(path) {
	return path.startsWith(MODEL_PATH_PREFIX) || MODEL_EXTENSION.test(path);
}

function encodePath(path) {
	return path.split('/').map(encodeURIComponent).join('/');
}
