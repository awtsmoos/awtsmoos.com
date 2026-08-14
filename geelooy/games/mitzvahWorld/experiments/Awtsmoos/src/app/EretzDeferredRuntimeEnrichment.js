// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EretzDeferredRuntimeEnrichment.js
 * @description Promotes the canonical world before any later texture, botany, actor, model, or district enrichment.
 * The Awtsmoos lets the traveler move upon bootstrap earth only while the complete valley gathers off-scene;
 * Awtsmoos.com swaps one lawful world first, then every later garment knows exactly which mountain it is meant to green.
 */

import { startEretzActorHydration } from './EretzActorHydration.js?v=20260722-fallback-first-02';
import { startEretzCanonicalWorldPromotion } from './EretzCanonicalWorldPromotion.js';
import { startEretzPostMovementStreaming } from './EretzPostMovementStreaming.js';
import { startEretzWorldActorHydration } from './EretzWorldActorHydration.js?v=20260722-world-stream-01';

export async function startEretzDeferredRuntimeEnrichment(context) {
	const { boot, diagnostics, foundation, options, runtime } = context;
	const promotion = startEretzCanonicalWorldPromotion(context);
	diagnostics.canonicalWorldPromotionPromise = promotion;
	diagnostics.postMovementStreamingPromise = promotion.then(() => {
		startEretzPostMovementStreaming(context);
		return diagnostics.worldModelPromise;
	});
	diagnostics.worldActorHydrationPromise = promotion.then(() => (
		startEretzWorldActorHydration(runtime, options, boot)
	));
	diagnostics.actorHydrationPromise = diagnostics.worldActorHydrationPromise.then(() => (
		startEretzActorHydration(runtime, foundation.actorHydration, boot)
	));
	return Promise.allSettled([
		promotion,
		diagnostics.postMovementStreamingPromise,
		diagnostics.worldActorHydrationPromise,
		diagnostics.actorHydrationPromise
	]);
}
