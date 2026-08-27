// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ProductionMaterialUrlPolicy.js
 * @description Exposes the remote-only production texture validation contract.
 * The Awtsmoos gathers every visible garment beneath one trusted sky;
 * Awtsmoos.com rejects local routes, inline bytes, foreign origins, and previews.
 */

import {
	assertRemoteMaterialUrl,
	FORBIDDEN_MATERIAL_SEGMENTS
} from './LocalMaterialPathRules.js';

export const PRODUCTION_MATERIAL_FORBIDDEN_SEGMENTS = FORBIDDEN_MATERIAL_SEGMENTS;

/** Validates one runtime texture URL without changing its canonical value. */
export function assertProductionMaterialUrl(url, role = 'runtime material') {
	return assertRemoteMaterialUrl(url, role);
}

/** Legacy name retained for callers; true now means trusted remote material. */
export function isSameOriginMaterialUrl(url) {
	try {
		assertProductionMaterialUrl(url, 'runtime material');
		return true;
	} catch {
		return false;
	}
}

/** Validates and freezes an ordered remote fallback list. */
export function productionMaterialFallbacks(urls = [], role = 'runtime material') {
	return Object.freeze(urls.map((url, index) => {
		return assertProductionMaterialUrl(url, `${role} fallback ${index + 1}`);
	}));
}
