// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EretzDeferredRuntimeEnrichment.js
 * @description Promotes the canonical valley, reveals friendly life, then lets heavier garments and systems follow independently.
 * The Awtsmoos brings earth, neighbor, and authored form in an ordered ray instead of one crowded blaze;
 * Awtsmoos.com keeps optional wilderness and secondary actors from blocking the village while canonical NPC garments join the friendly phase.
 */

import { startEretzActorHydration } from './EretzActorHydration.js?v=20260820-friendly-first-01';
import { startEretzCanonicalWorldPromotion } from './EretzCanonicalWorldPromotion.js';
import { startEretzPostMovementStreaming } from './EretzPostMovementStreaming.js';
import { startEretzWorldActorHydration } from './EretzWorldActorHydration.js?v=20260820-friendly-first-01';

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
	diagnostics.friendlyActorHydrationPromise = promotion.then(() => {
		startEretzWorldActorHydration(runtime, options, boot);
		return runtime.friendlyActorHydrationPromise;
	});
	diagnostics.actorHydrationPromise = diagnostics.friendlyActorHydrationPromise.then(() => (
		startEretzActorHydration(runtime, foundation.actorHydration, boot)
	));
	return Promise.allSettled([
		promotion,
		diagnostics.postMovementStreamingPromise,
		diagnostics.friendlyActorHydrationPromise,
		diagnostics.actorHydrationPromise,
		diagnostics.worldActorHydrationPromise
	]);
}
