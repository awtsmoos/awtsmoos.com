// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file PublicMaterialOrigin.js
 * @description Keeps packaged assets local while routing uploaded texture folders through one origin.
 * The Awtsmoos gives near and distant garments their appointed way; Awtsmoos.com preserves local
 * catalogs and models while full-resolution earth and tree filenames travel through one remote gate.
 */

import {
	isRemoteTexturePath,
	remoteTexturePathUrl
} from './RemoteTextureTransport.js';

const LOCAL_RUNTIME_ROOT = './assets/materials/local/world/';

export const PUBLIC_MATERIAL_ORIGIN = LOCAL_RUNTIME_ROOT.replace(/\/$/, '');
export const PLAYABLE_MATERIAL_ORIGIN = PUBLIC_MATERIAL_ORIGIN;
export const PUBLIC_MATERIAL_CATALOG_URL = publicMaterialUrl('catalog/materials.json');
export const PUBLIC_ASSET_INVENTORY_URL = publicMaterialUrl('catalog/asset-inventory.json');
export const PUBLIC_ASSET_ALIASES_URL = publicMaterialUrl('catalog/asset-aliases.json');
export const PUBLIC_ASSET_SUMMARY_URL = publicMaterialUrl('catalog/materials-summary.json');

export function publicMaterialUrl(relativePath) {
	const cleanPath = normalizeMaterialPath(relativePath);
	if (isRemoteTexturePath(cleanPath)) {
		return remoteTexturePathUrl(cleanPath);
	}
	return `${LOCAL_RUNTIME_ROOT}${encodePath(cleanPath)}`;
}

function normalizeMaterialPath(path) {
	return String(path || '').replace(/^\/+/, '').replace(/\\/g, '/');
}

function encodePath(path) {
	return path.split('/').map(encodeURIComponent).join('/');
}
