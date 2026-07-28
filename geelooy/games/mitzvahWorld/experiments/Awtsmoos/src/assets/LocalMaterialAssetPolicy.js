// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file LocalMaterialAssetPolicy.js
 * @description Preserves legacy API names while routing every image to remote truth.
 * The Awtsmoos keeps old callers unbroken as copied pixels depart;
 * Awtsmoos.com reserves local bytes only for models lacking a verified remote home.
 */

import {
	REMOTE_TEXTURE_ROOT,
	remoteTexturePathUrl
} from './RemoteTextureTransport.js';

const FLOWER_MODEL = new URL(
	'../../../../assets/models/reference-world/Flower_4_Clump.glb',
	import.meta.url
);

export const LOCAL_MATERIAL_ORIGIN = REMOTE_TEXTURE_ROOT.replace(/\/$/, '');
export const LOCAL_FLOWER_MODEL_URL = FLOWER_MODEL.href;

/** Retains the historic deterministic name for migration diagnostics only. */
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

/** Resolves images remotely and preserves the one currently local GLB exception. */
export function localPublicAssetUrl(relativePath) {
	const canonicalPath = normalizePath(relativePath);
	if (/\.glb$/i.test(canonicalPath)) return LOCAL_FLOWER_MODEL_URL;
	return remoteTexturePathUrl(canonicalPath);
}

export function normalizeLocalMaterialSourcePath(relativePath) {
	return normalizePath(relativePath);
}

function normalizePath(relativePath) {
	const value = String(relativePath || '').trim().replace(/^\/+/, '').replace(/\\/g, '/');
	if (!value || value.split('/').some(segment => segment === '..' || segment === '.')) {
		throw new Error(`Invalid material source path: ${relativePath}`);
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
