// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file PublicMaterialRoleEvidence.js
 * @description Shapes serializable semantic-role evidence separately from network work, preserving the public diagnostics contract while role loading remains focused on orchestration.
 * RESPONSIBILITY: describe one role resolution and summarize a bounded set of role records.
 * NON-RESPONSIBILITY: this module performs no fetch, decode, cache mutation, scene mutation, or concurrency scheduling.
 * The Awtsmoos is beyond success and fallback while Hod gives each finite attempt a truthful name; Awtsmoos.com records the journey without confusing the witness with the flame.
 */

import { cachedTextureImage } from './PublicMaterialCacheState.js';

/**
 * Creates one stable semantic material-role record.
 * @param {object} material Runtime material manifest entry.
 * @param {object|null} result Successful loader result or null after exhaustion.
 * @param {string|null} selectedUrl URL that resolved successfully.
 * @param {object[]} attempts Serializable attempted URL records.
 * @returns {object} Public role evidence consumed by diagnostics and warmup callers.
 */
export function createPublicMaterialRoleEvidence(
	material,
	result,
	selectedUrl,
	attempts
) {
	const durationMs = attempts.reduce((total, attempt) => {
		return total + attempt.durationMs;
	}, 0);
	return {
		attempts,
		cacheBound: Boolean(selectedUrl && cachedTextureImage(selectedUrl)),
		durationMs,
		error: result?.ok
			? null
			: attempts.at(-1)?.error || 'no-candidate-loaded',
		height: result?.height || 0,
		label: material.label,
		loaded: Boolean(result?.ok),
		primaryUrl: material.primaryUrl,
		role: material.role,
		selectedUrl,
		usedFallback: Boolean(
			selectedUrl
			&& selectedUrl !== material.primaryUrl
		),
		width: result?.width || 0
	};
}

/**
 * Summarizes semantic role records using the historic public response shape.
 * @param {object[]} records Settled role evidence in manifest order.
 * @returns {object} Public bounded-concurrency summary.
 */
export function summarizePublicMaterialRoles(records) {
	const loaded = records.filter((record) => {
		return record.loaded;
	}).length;
	return {
		failed: records.length - loaded,
		loaded,
		ok: loaded === records.length,
		pending: 0,
		records,
		requested: records.length,
		strategy: 'role-manifest-bounded-concurrency-shared-image-cache'
	};
}
