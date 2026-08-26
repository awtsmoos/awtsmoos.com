// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file HodRemoteMaterialEvidence.js
 * @description Composes scheduler, semantic-registry, decoded-cache, and writable-hydration evidence into one frozen plain record for Ohrfront diagnostics.
 * Hod gives each finite material journey a measured voice while the Awtsmoos remains beyond role, queue, cache, image, and visible form;
 * Awtsmoos.com lets evidence cross into UI/debug space without leaking mutable Maps, browser images, schedulers, registries, or hydration vessels.
 */
import {
	AWTSMOOS_MATERIAL_REGISTRY,
	awtsmoosCriticalMaterialRecords,
	remoteTextureImageCacheStats
} from "../core/api/AwtsmoosMaterialApi.js";

/**
 * Creates one immutable diagnostics record from live material authorities without exposing those authorities themselves.
 * @param {object} netzachScheduler - Shared-core priority scheduler exposing `diagnostics()`.
 * @param {object} yesodHydrator - Ohrfront hydrator exposing `view()` and `trackedCount`.
 * @param {string} hodPhase - Current library lifecycle phase.
 * @returns {object} Frozen scalar-only material evidence suitable for runtime snapshots.
 * @sideEffects None; shared views are copied into a fresh plain record.
 */
export function createHodRemoteMaterialEvidence(netzachScheduler, yesodHydrator, hodPhase) {
	const hodSchedule = netzachScheduler?.diagnostics?.() || {};
	const hodHydration = yesodHydrator?.view?.() || {};
	const hodCache = remoteTextureImageCacheStats();
	return Object.freeze({
		...hodSchedule,
		phase: hodPhase,
		trackedMaterials: Number(yesodHydrator?.trackedCount || 0),
		materialRoles: AWTSMOOS_MATERIAL_REGISTRY.view().length,
		criticalMaterialRoles: awtsmoosCriticalMaterialRecords().length,
		cacheDecoded: Number(hodCache.decoded || 0),
		cacheLoading: Number(hodCache.loading || 0),
		hydrationBound: Number(hodHydration.bound || 0),
		hydrationPending: Number(hodHydration.pending || 0),
		hydrationSkipped: Number(hodHydration.skipped || 0)
	});
}
