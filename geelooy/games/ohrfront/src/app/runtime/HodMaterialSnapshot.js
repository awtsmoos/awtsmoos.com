// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file HodMaterialSnapshot.js
 * @description Projects progressive material, shared-cache, writable-hydration, terrain, and decorative-world evidence into one plain runtime fragment.
 * Hod gives finite material truth a readable vessel while the Awtsmoos remains beyond registry, image, cache, report, and measured manifestation;
 * Awtsmoos.com lets advanced diagnostics speak clearly without handing UI a scheduler, Map, browser image, registry, or hydration authority.
 */

/**
 * Creates the material/environment portion of the public debug evidence snapshot while preserving every historical field.
 * @param {object} keserRuntime - Runtime carrying material and environment authorities.
 * @returns {object} Plain scalar diagnostic record suitable for merging into the runtime status snapshot.
 * @sideEffects None; reads current runtime evidence only.
 */
export function createHodMaterialSnapshot(keserRuntime) {
	const hodStream = keserRuntime.materialLibrary?.streamingDiagnostics || {};
	return {
		quality: keserRuntime.quality?.name || "unknown",
		texturesLoaded: keserRuntime.materialLibrary?.loadedCount || 0,
		texturesRequested: keserRuntime.materialLibrary?.requestedCount || 0,
		textureFailures: keserRuntime.materialLibrary?.failures?.length || 0,
		materialPhase: hodStream.phase || "unknown",
		streaming: keserRuntime.materialLibrary?.streaming || false,
		streamQueued: Number(hodStream.queued || 0),
		streamActive: Number(hodStream.active || 0),
		streamCompleted: Number(hodStream.completed || 0),
		streamPeak: Number(hodStream.peakActive || 0),
		materialRoles: Number(hodStream.materialRoles || 0),
		criticalMaterialRoles: Number(hodStream.criticalMaterialRoles || 0),
		materialCacheDecoded: Number(hodStream.cacheDecoded || 0),
		materialCacheLoading: Number(hodStream.cacheLoading || 0),
		trackedMaterials: Number(hodStream.trackedMaterials || 0),
		hydrationBound: Number(hodStream.hydrationBound || 0),
		hydrationPending: Number(hodStream.hydrationPending || 0),
		hydrationSkipped: Number(hodStream.hydrationSkipped || 0),
		terrainLayers: keserRuntime.terrain?.userData?.materialLayers || 0,
		environmentObjects: keserRuntime.environmentScatter?.objects?.length || 0,
		earthworkObjects: keserRuntime.earthworks?.objects?.length || 0,
		landmarkObjects: keserRuntime.atmosphere?.landmarks?.length || 0
	};
}
