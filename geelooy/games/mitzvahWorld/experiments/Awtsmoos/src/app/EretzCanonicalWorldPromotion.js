// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EretzCanonicalWorldPromotion.js
 * @description Builds, swaps, and activates the canonical world before publishing one truthful ready state.
 * The Awtsmoos lets the valley and its heartbeat arrive as one completed revelation; Awtsmoos.com refuses
 * to call the world ready while a bootstrap scheduler still rules animation, water, shadow, camera, or movement timing.
 */

import { buildCanonicalWorldPromotion } from './EretzCanonicalWorldBuilder.js';
import { applyCanonicalWorldPromotion } from './EretzCanonicalWorldHandoff.js';
import { promoteEretzRuntimeLoop } from './EretzRuntimePromotion.js';

/** Starts canonical world and runtime-loop promotion once per live runtime. */
export function startEretzCanonicalWorldPromotion(context, dependencies = {}) {
	const { diagnostics, runtime } = context;
	if (diagnostics.canonicalWorldPromotionPromise) {
		return diagnostics.canonicalWorldPromotionPromise;
	}
	const build = dependencies.build || buildCanonicalWorldPromotion;
	const apply = dependencies.apply || applyCanonicalWorldPromotion;
	const promoteRuntime = dependencies.promoteRuntime || promoteEretzRuntimeLoop;
	diagnostics.canonicalWorldPromotionStage = 'building';
	const promise = build(context)
		.then(promotion => {
			diagnostics.canonicalWorldPromotionStage = 'swapping';
			const worldReceipt = apply(context, promotion);
			diagnostics.canonicalWorldPromotionStage = 'promoting-runtime';
			const runtimePromotion = promoteRuntime(context);
			diagnostics.runtimeLoopPromotion = runtimePromotion.receipt;
			diagnostics.canonicalWorldPromotionStage = 'ready';
			diagnostics.canonicalWorldPromotion = worldReceipt;
			return worldReceipt;
		})
		.catch(error => {
			diagnostics.canonicalWorldPromotionError = error;
			diagnostics.canonicalWorldPromotionStage = 'degraded';
			runtime.canonicalWorldPromotion = Object.freeze({
				error: error?.message || String(error),
				status: 'degraded'
			});
			console.warn('[MitzvahWorld] Canonical world promotion degraded.', error);
			return runtime.canonicalWorldPromotion;
		});
	diagnostics.canonicalWorldPromotionPromise = promise;
	return promise;
}
