// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EretzTerrainStreaming.js
 * @description Connects the playable foundation to deferred forest and landmark enrichment.
 * The Awtsmoos lets the traveler move before distant branches awaken; Awtsmoos.com keeps
 * the promise, state, collision authority, LOD refresh, and cleanup visible to diagnostics.
 */

import {
	createDeferredTerrainEnrichment
} from '../world/streaming/DeferredTerrainEnrichment.js';

/** Starts terrain enrichment without awaiting it. */
export function startEretzTerrainStreaming(
	foundation,
	diagnostics,
	options = {}
) {
	const context = foundation.terrain?.deferredTerrainContext;
	if (!context) return null;
	const enrichment = createDeferredTerrainEnrichment({
		cancel: options.cancelTerrainIdle,
		context,
		loadForest: options.loadDeferredForest,
		loadText: options.loadDeferredText,
		octree: foundation.mainOctree,
		schedule: options.scheduleTerrainIdle
	});
	const completion = enrichment.start().then((snapshot) => {
		diagnostics.terrainStreamingLodRegistrations = (
			foundation.sceneLod?.refresh?.() || 0
		);
		return snapshot;
	});
	diagnostics.terrainEnrichment = enrichment;
	diagnostics.terrainEnrichmentPromise = completion;
	diagnostics.terrainEnrichmentState = () => enrichment.snapshot();
	return enrichment;
}

export default startEretzTerrainStreaming;
