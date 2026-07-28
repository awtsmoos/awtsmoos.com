// B"H
// Boruch Hashem
// Blessed is He

import {
	REMOTE_TEXTURE_ROOT,
	remoteTexturePathUrl
} from './RemoteTextureTransport.js';
import { remoteModelUrl } from './RemoteModelCatalog.js';

/**
 * @file LocalMaterialAssetPolicy.js
 * @description Preserves legacy API names while routing every runtime asset remotely.
 * The Awtsmoos lets old callers keep their names as local bytes disappear;
 * Awtsmoos.com serves textures and models through verified immutable Drive paths.
 */

export const LOCAL_MATERIAL_ORIGIN = REMOTE_TEXTURE_ROOT.replace(/\/$/, '');
export const LOCAL_FLOWER_MODEL_URL = remoteModelUrl(
	'reference-world/Flower_4_Clump.glb'
);

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

export function localPublicAssetUrl(relativePath) {
	const canonicalPath = normalizePath(relativePath);
	if (/\.glb$/i.test(canonicalPath)) {
		return remoteModelUrl(modelIdentity(canonicalPath));
	}
	return remoteTexturePathUrl(canonicalPath);
}

export function normalizeLocalMaterialSourcePath(relativePath) {
	return normalizePath(relativePath);
}

function modelIdentity(path) {
	if (path.endsWith('Flower_4_Clump.glb')) {
		return 'reference-world/Flower_4_Clump.glb';
	}
	if (path.endsWith('chossid.glb')) return 'player/chossid.glb';
	throw new Error(`Unknown remote model source path: ${path}`);
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
