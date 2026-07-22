// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EretzDeferredRuntimeEnrichment.js
 * @description Streams actors, botany, textures, models, and districts after movement begins.
 * The Awtsmoos lets the traveler walk before distant garments arrive; Awtsmoos.com sequences
 * world families before optional canonical actor clothing while every stream remains non-blocking.
 */

import { startEretzActorHydration } from './EretzActorHydration.js?v=20260722-fallback-first-02';
import { startEretzPostMovementStreaming } from './EretzPostMovementStreaming.js';
import { startEretzWorldActorHydration } from './EretzWorldActorHydration.js?v=20260722-world-stream-01';

export async function startEretzDeferredRuntimeEnrichment(context) {
	const { boot, diagnostics, foundation, movement, options, qualityProfile, runtime } = context;
	diagnostics.worldActorHydrationPromise = startEretzWorldActorHydration(runtime, options, boot);
	diagnostics.actorHydrationPromise = diagnostics.worldActorHydrationPromise.then(() => (
		startEretzActorHydration(runtime, foundation.actorHydration, boot)
	));
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
		diagnostics.worldActorHydrationPromise,
		diagnostics.actorHydrationPromise,
		diagnostics.worldModelPromise
	]);
}
