// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file LocalMaterialAssetPolicy.js
 * @description Resolves canonical source identities into same-origin generated assets.
 * The Awtsmoos preserves the name of every finite garment while Awtsmoos.com replaces
 * a vanished public doorway with deterministic local light that cannot fail by CORS.
 */

const GENERATED_ROOT = new URL(
	'../../../../assets/materials/generated/',
	import.meta.url
);
const FLOWER_MODEL = new URL(
	'../../../../assets/models/reference-world/Flower_4_Clump.glb',
	import.meta.url
);

export const LOCAL_MATERIAL_ORIGIN = GENERATED_ROOT.href.replace(/\/$/, '');
export const LOCAL_FLOWER_MODEL_URL = FLOWER_MODEL.href;

/**
 * Returns the stable generated filename for one canonical material source path.
 *
 * @param {string} relativePath Original semantic source identity.
 * @returns {string} Collision-resistant SVG filename.
 */
export function localMaterialFilename(relativePath) {
	const canonicalPath = normalizePath(relativePath);
	const stem = canonicalPath
		.replace(/\.[a-z0-9]+$/i, '')
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-|-$/g, '')
		.slice(0, 72) || 'material';
	return `${stem}-${shortHash(canonicalPath)}.svg`;
}

/**
 * Resolves bytes locally while retaining the canonical source path as URL evidence.
 *
 * @param {string} relativePath Canonical public source path.
 * @returns {string} Local URL with a non-routing semantic source witness.
 */
export function localPublicAssetUrl(relativePath) {
	const canonicalPath = normalizePath(relativePath);
	const localUrl = /\.glb$/i.test(canonicalPath)
		? LOCAL_FLOWER_MODEL_URL
		: new URL(localMaterialFilename(canonicalPath), GENERATED_ROOT).href;
	return `${localUrl}?source=/${encodedCanonicalPath(canonicalPath)}`;
}

export function normalizeLocalMaterialSourcePath(relativePath) {
	return normalizePath(relativePath);
}

function encodedCanonicalPath(canonicalPath) {
	return canonicalPath
		.split('/')
		.map(encodeURIComponent)
		.join('/');
}

function normalizePath(relativePath) {
	const value = String(relativePath || '')
		.replace(/^\/+/, '')
		.replace(/\\/g, '/');
	if (!value || value.split('/').includes('..')) {
		throw new Error(`Invalid local material source path: ${relativePath}`);
	}
	return value;
}

function shortHash(value) {
	let hash = 2166136261;
	for (const character of value) {
		hash ^= character.charCodeAt(0);
		hash = Math.imul(hash, 16777619);
	}
	return (hash >>> 0).toString(16).padStart(8, '0');
}
