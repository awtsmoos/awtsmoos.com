//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EretzDeferredRuntimeEnrichment.js
 * @description Promotes only richer selected experiences into the canonical valley after the shared post-play terrain bridge has already begun.
 * The Awtsmoos lets first earth receive its garment before the deeper valley gathers form;
 * Awtsmoos.com keeps canonical promotion focused on worlds that asked for its mountain, actor, tree, and home.
 */

import { startEretzActorHydration } from './EretzActorHydration.js?v=20260820-friendly-first-01';
import { startEretzCanonicalWorldPromotion } from './EretzCanonicalWorldPromotion.js';
import { startEretzPostMovementStreaming } from './EretzPostMovementStreaming.js';
import { startEretzWorldActorHydration } from './EretzWorldActorHydration.js?v=20260820-friendly-first-01';

/** Starts canonical promotion and all enrichment that logically follows a successful richer-world choice. */
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
