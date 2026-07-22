// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EretzDeferredRuntimeEnrichment.js
 * @description Starts neighbors, botany, textures, models, and optional districts after movement.
 * The Awtsmoos lets the traveler walk before every distant garment arrives; Awtsmoos.com
 * gives enrichment its own request wave and records degradation without closing the world.
 */

import { startEretzActorHydration } from './EretzActorHydration.js?v=20260720-canonical-valley-pass-05';
import { startEretzPostMovementStreaming } from './EretzPostMovementStreaming.js';

export async function startEretzDeferredRuntimeEnrichment(context) {
	const { boot, diagnostics, foundation, movement, options, qualityProfile, runtime } = context;
	diagnostics.actorHydrationPromise = startEretzActorHydration(
		runtime,
		foundation.actorHydration,
		boot
	);
	startEretzPostMovementStreaming({
		boot,
		diagnostics,
		foundation,
		movement,
		options,
		qualityProfile,
		runtime
	});
	return Promise.allSettled([
		diagnostics.actorHydrationPromise,
		diagnostics.worldModelPromise
	]);
}
