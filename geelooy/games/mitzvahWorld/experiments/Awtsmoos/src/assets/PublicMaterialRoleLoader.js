// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file PublicMaterialRoleLoader.js
 * @description Coordinates bounded semantic-material batches while a focused resolver owns the fallback journey of each individual role.
 * RESPONSIBILITY: run bounded workers, preload critical roles, expose canonical URLs, and preserve the historic role-loading API doorway.
 * NON-RESPONSIBILITY: this module does not fetch raw images, resolve individual fallback candidates, shape role evidence internals, or mutate scene slots.
 * The Awtsmoos gives many garments one ordered procession; Awtsmoos.com lets Netzach advance the workers while each role resolver carries its own devotion.
 */

import {
	CRITICAL_RUNTIME_MATERIALS,
	RUNTIME_MATERIALS
} from './RuntimeMaterialManifest.js';
import { summarizePublicMaterialRoles } from './PublicMaterialRoleEvidence.js';
import { loadRuntimeMaterial } from './PublicMaterialRoleResolver.js';

export {
	loadRuntimeMaterial
} from './PublicMaterialRoleResolver.js';

/**
 * Loads semantic roles with bounded concurrency and optional settled callbacks.
 * @param {object[]} materials Runtime material manifest entries.
 * @param {object} options Concurrency, timeout, and callback policy.
 * @returns {Promise<object>} Stable role-loading summary.
 */
export async function loadRuntimeMaterialRoles(
	materials = RUNTIME_MATERIALS,
	options = {}
) {
	const records = new Array(materials.length);
	const cursor = {
		index: 0
	};
	const concurrency = boundedRoleConcurrency(
		options.concurrency,
		materials.length
	);
	const workers = Array.from({ length: concurrency }, () => {
		return loadRoleWorker(materials, options, records, cursor);
	});
	await Promise.all(workers);
	return summarizePublicMaterialRoles(records);
}

/**
 * Loads critical first-frame roles unless the caller explicitly requests every role.
 * @param {object} options Role preload policy.
 * @returns {Promise<object>} Stable role-loading summary.
 */
export async function preloadPublicMaterialImages(options = {}) {
	const source = options.all
		? RUNTIME_MATERIALS
		: CRITICAL_RUNTIME_MATERIALS;
	const limit = options.limit ?? source.length;
	return loadRuntimeMaterialRoles(source.slice(0, limit), options);
}

/**
 * Returns canonical primary material URLs in manifest order.
 * @returns {ReadonlyArray<string>} Frozen URL list.
 */
export function runtimeMaterialUrls() {
	const urls = RUNTIME_MATERIALS.map((material) => {
		return material.primaryUrl;
	});
	return Object.freeze(urls);
}

/**
 * Claims manifest indexes from a shared cursor until one bounded worker has no work left.
 * @param {object[]} materials Manifest entries.
 * @param {object} options Loading policy.
 * @param {object[]} records Shared ordered results.
 * @param {{index:number}} cursor Shared monotonic cursor.
 * @returns {Promise<void>}
 */
async function loadRoleWorker(materials, options, records, cursor) {
	while (cursor.index < materials.length) {
		const index = cursor.index;
		cursor.index += 1;
		const record = await loadRuntimeMaterial(materials[index], options);
		records[index] = record;
		options.onSettled?.(record, index);
	}
}

/**
 * Clamps requested concurrency to one or the number of available manifest entries.
 * @param {number|undefined} requested Requested worker count.
 * @param {number} materialCount Number of manifest entries.
 * @returns {number} Safe worker count.
 */
function boundedRoleConcurrency(requested, materialCount) {
	const normalized = requested ?? 3;
	return Math.max(1, Math.min(normalized, materialCount || 1));
}
