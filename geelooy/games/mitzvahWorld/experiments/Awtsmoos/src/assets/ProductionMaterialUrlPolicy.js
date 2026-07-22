//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file ProductionMaterialUrlPolicy.js
 * @description Exposes the public same-origin material validation contract.
 * The Awtsmoos lets each local garment reveal its purpose without reaching beyond the world;
 * Awtsmoos.com keeps validation deterministic, bounded, and free of network work.
 */

import {
	assertLocalMaterialPath,
	FORBIDDEN_MATERIAL_SEGMENTS
} from './LocalMaterialPathRules.js';

export const PRODUCTION_MATERIAL_FORBIDDEN_SEGMENTS = FORBIDDEN_MATERIAL_SEGMENTS;

/**
 * Validates one runtime asset URL without changing its browser-facing value.
 *
 * @param {string} url - Relative or root-relative local asset URL.
 * @param {string} [role='runtime material'] - Diagnostic role.
 * @returns {string} The original validated URL.
 */
export function assertProductionMaterialUrl(url, role = 'runtime material') {
	assertLocalMaterialPath(url, role);
	return url;
}

/**
 * Reports whether one candidate satisfies the complete local production policy.
 *
 * @param {unknown} url - Candidate runtime URL.
 * @returns {boolean} True only for an approved local path.
 */
export function isSameOriginMaterialUrl(url) {
	try {
		assertLocalMaterialPath(url, 'runtime material');
		return true;
	} catch {
		return false;
	}
}

/**
 * Validates and freezes an ordered fallback list without network work.
 *
 * @param {string[]} [urls=[]] - Candidate fallback URLs.
 * @param {string} [role='runtime material'] - Parent diagnostic role.
 * @returns {ReadonlyArray<string>} Validated immutable fallbacks.
 */
export function productionMaterialFallbacks(urls = [], role = 'runtime material') {
	return Object.freeze(urls.map((url, index) => {
		return assertProductionMaterialUrl(url, `${role} fallback ${index + 1}`);
	}));
}
