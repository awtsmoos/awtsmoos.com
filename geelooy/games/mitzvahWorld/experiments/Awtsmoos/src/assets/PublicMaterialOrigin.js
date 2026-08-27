// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file PublicMaterialOrigin.js
 * @description Resolves every material identity through one verified remote origin.
 * The Awtsmoos lets no copied pixel masquerade as source;
 * Awtsmoos.com keeps catalogs, textures, and aliases beneath one HTTPS root.
 */

import {
	REMOTE_TEXTURE_ROOT,
	remoteTexturePathUrl
} from './RemoteTextureTransport.js';

export const PUBLIC_MATERIAL_ORIGIN = REMOTE_TEXTURE_ROOT.replace(/\/$/, '');
export const PLAYABLE_MATERIAL_ORIGIN = PUBLIC_MATERIAL_ORIGIN;
export const PUBLIC_MATERIAL_CATALOG_URL = publicMaterialUrl('catalog/materials.json');
export const PUBLIC_ASSET_INVENTORY_URL = publicMaterialUrl('catalog/asset-inventory.json');
export const PUBLIC_ASSET_ALIASES_URL = publicMaterialUrl('catalog/asset-aliases.json');
export const PUBLIC_ASSET_SUMMARY_URL = publicMaterialUrl('catalog/materials-summary.json');

/** Resolves a canonical migration path without local or inline fallback. */
export function publicMaterialUrl(relativePath) {
	return remoteTexturePathUrl(normalizeMaterialPath(relativePath));
}

function normalizeMaterialPath(path) {
	return String(path || '').trim().replace(/^\/+/, '').replace(/\\/g, '/');
}
