// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file PublicMaterialRoleResolver.js
 * @description Resolves one semantic runtime-material role through its declared fallback chain while preserving shared image aliases and stable role evidence.
 * RESPONSIBILITY: attempt candidate URLs in order, record serializable attempts, alias a successful decoded image, and remember one semantic role receipt.
 * NON-RESPONSIBILITY: this module does not schedule concurrent role batches, preload manifests, traverse scenes, or bind renderer slots.
 * The Awtsmoos is beyond primary and fallback while every finite garment seeks a fitting ray; Awtsmoos.com lets one role walk its ordered gates until decoded light can stay.
 */

import { serializableImageRecord } from './PublicMaterialImageLoader.js';
import {
	rememberPublicMaterialImage,
	rememberPublicMaterialRole
} from './PublicMaterialCacheState.js';
import { createPublicMaterialRoleEvidence } from './PublicMaterialRoleEvidence.js';
import { loadPublicMaterialUrl } from './PublicMaterialUrlLoader.js';

/**
 * Loads one semantic material role through its declared fallback URLs.
 * @param {object} material Runtime material manifest entry.
 * @param {object} options Loading policy including timeout.
 * @returns {Promise<object>} Stable semantic role evidence.
 */
export async function loadRuntimeMaterial(material, options = {}) {
	const candidates = [
		material.primaryUrl,
		...material.fallbackUrls
	];
	const attempts = [];
	for (const candidate of candidates) {
		const result = await loadPublicMaterialUrl(
			candidate,
			options.timeoutMs
		);
		attempts.push(serializableImageRecord(result));
		if (!result.ok) {
			continue;
		}
		rememberPublicMaterialImage(candidates, result.image);
		return rememberRole(material, result, candidate, attempts);
	}
	return rememberRole(material, null, null, attempts);
}

/**
 * Persists one stable semantic-role receipt in the shared evidence registry.
 * @param {object} material Runtime manifest entry.
 * @param {object|null} result Settled URL-loader result.
 * @param {string|null} selectedUrl Successful URL or null.
 * @param {object[]} attempts Serializable candidate attempts.
 * @returns {object} Remembered role evidence.
 */
function rememberRole(material, result, selectedUrl, attempts) {
	const record = createPublicMaterialRoleEvidence(
		material,
		result,
		selectedUrl,
		attempts
	);
	rememberPublicMaterialRole(material.role, record);
	return record;
}
