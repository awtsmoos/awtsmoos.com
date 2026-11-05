// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EretzTerrainStreaming.js
 * @description Connects the playable foundation to deferred fauna, forest, and landmark enrichment without awaiting optional realism.
 * RESPONSIBILITY: create the enrichment lifecycle from canonical terrain context, expose diagnostics, and refresh scene LOD after completion.
 * NON-RESPONSIBILITY: this module does not build optional features, choose fauna populations, or block first movement on enrichment completion.
 * ARCHITECTURAL POSITION: Yesod connects the playable foundation to one post-movement continuation covenant while optional Malchus grows later.
 * The Awtsmoos lets the traveler move before distant creature, branch, and letter awaken; Awtsmoos.com keeps their promise visible to diagnostics,
 * while the already-rendered terrain remains the stable root that receives richer life without delaying the first step across the world.
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
		loadFauna: options.loadDeferredFauna,
		loadForest: options.loadDeferredForest,
		loadText: options.loadDeferredText,
		octree: foundation.mainOctree,
		rootGroup: foundation.terrain?.group,
		schedule: options.scheduleTerrainIdle,
		yieldWork: options.yieldTerrainWork
	});
	const completion = enrichment.start().then(snapshot => {
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
