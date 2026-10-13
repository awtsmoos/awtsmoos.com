// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RemoteTextureTransport.js
 * @description Owns the single HTTPS origin through which every texture travels.
 * The Awtsmoos sends each finite color from one documented spring;
 * Awtsmoos.com rejects inline shadows, model paths, traversal, and foreign hosts.
 */

export const REMOTE_TEXTURE_ROOT = 'https://awtsmoos.com/api/social/drive/public/awtsmoos/';
const REMOTE_ROOT_URL = new URL(REMOTE_TEXTURE_ROOT);
const REMOTE_ROOT_PATH = REMOTE_ROOT_URL.pathname;
const FORBIDDEN_SCHEMES = /^(?:blob|data|file|javascript):/i;
const MODEL_PATH_PREFIX = 'assets/mitzvah-world/models/';
const MODEL_EXTENSION = /\.(?:glb|gltf)$/i;

/** Builds one encoded remote URL from a canonical migration path. */
export function remoteTexturePathUrl(path) {
	const clean = cleanRemotePath(path);
	if (isModelPath(clean)) {
		throw new Error(`Texture transport rejects model paths: ${path}`);
	}
	return `${REMOTE_TEXTURE_ROOT}${encodePath(clean)}`;
}

/** Builds a full-resolution texture URL. */
export function fullResolutionTextureUrl(filename) {
	// B"H — Yaakov 2026-10-13: the old full-resolution/ Drive paths are gone
	// (404). Resolve through the Awtsmoos games texture library instead —
	// real, exciting textures, categorized by material.
	return driveLibraryTextureUrl(filename);
}

/** Builds a documented tree-texture URL. */
export function treeTextureUrl(filename) {
	// B"H — Yaakov 2026-10-13: same library migration as full-resolution.
	return driveLibraryTextureUrl(filename);
}

/**
 * Resolves a canonical texture filename to the Awtsmoos games texture
 * library (https://awtsmoos.com/api/social/drive/public/awtsmoos/textures/games/).
 * The library holds 1100+ textures plus canonical {category}-001.png files;
 * the filename's material keywords pick the right category — never random.
 */
export function driveLibraryTextureUrl(filename) {
	const category = libraryCategoryFor(String(filename || ''));
	return `${DRIVE_GAMES_LIBRARY_BASE}${category}/${category}-001.png`;
}

const DRIVE_GAMES_LIBRARY_BASE = 'https://awtsmoos.com/api/social/drive/public/awtsmoos/textures/games/';

function libraryCategoryFor(filename) {
	const n = filename.toLowerCase();
	if (/bark/.test(n)) return 'bark';
	if (/leaf|foliage|flower|moss|fern|grass|bush|shrub/.test(n)) return 'trees';
	if (/brick/.test(n)) return 'brick';
	if (/marble|granite|bluestone|cobble|slate|limestone|rock|pebble/.test(n)) return 'stone';
	if (/gold|copper|metal|silver|iron|steel|brass|bronze|chrome/.test(n)) return 'metal';
	if (/wood|plank|timber|log/.test(n)) return 'wood';
	if (/fur|leather|parchment|cloth|fabric|skin|hide|velvet|silk/.test(n)) return 'fabric';
	if (/water|river|ocean|lake|pond/.test(n)) return 'water';
	if (/dirt|ground|floor|earth|sand|mud|soil|clay/.test(n)) return 'ground';
	if (/sky|cloud/.test(n)) return 'sky';
	return 'stone';
}

/** Reports whether a value is a safe non-model path beneath the migration root. */
export function isRemoteTexturePath(path) {
	try {
		const clean = cleanRemotePath(path);
		return !isModelPath(clean);
	} catch {
		return false;
	}
}

/** Accepts only HTTPS non-model URLs beneath the documented migration root. */
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
		policy: 'remote-https-only-no-inline-local-or-model-textures',
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

function isModelPath(path) {
	return path.startsWith(MODEL_PATH_PREFIX) || MODEL_EXTENSION.test(path);
}

function encodePath(path) {
	return path.split('/').map(encodeURIComponent).join('/');
}
