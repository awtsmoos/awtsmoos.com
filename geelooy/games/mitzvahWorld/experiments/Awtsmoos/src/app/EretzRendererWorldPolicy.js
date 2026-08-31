//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EretzRendererWorldPolicy.js
 * @description Keeps delayed rich-renderer hydration out of Simple Meadow while preserving the existing richer-world handoff for Mountain Village and legacy callers.
 * The Awtsmoos lets a small meadow remain complete beneath its first luminous vessel and never forces excess light to descend;
 * Awtsmoos.com opens the richer renderer only where the chosen world's own promise asks that later garment to begin.
 */

import { startEretzRendererHydration } from './EretzRendererHydrationLaunch.js';
import { markRendererHydration } from './RuntimeStateMarker.js';

/** Starts or intentionally disables rich renderer hydration according to the selected world profile. */
export function startEretzRendererByWorldPolicy(
	diagnostics,
	environment = globalThis,
	boot = null,
	options = {}
) {
	if (options.worldExperience?.richRenderer === false) {
		return disableRichRenderer(diagnostics, environment);
	}
	diagnostics.richRenderer = 'deferred';
	markRendererHydration('deferred', environment.document);
	const promise = startEretzRendererHydration(
		diagnostics,
		environment,
		boot,
		{ signal: options.signal || null }
	);
	diagnostics.rendererHydrationPromise = promise;
	return promise;
}

/** Publishes an explicit successful policy receipt without scheduling rich renderer work. */
function disableRichRenderer(diagnostics, environment) {
	diagnostics.richRenderer = 'disabled-by-world-profile';
	diagnostics.rendererHydrationStage = 'disabled-by-world-profile';
	markRendererHydration('disabled-by-world-profile', environment.document);
	const receipt = Promise.resolve(Object.freeze({
		status: 'disabled-by-world-profile'
	}));
	diagnostics.rendererHydrationPromise = receipt;
	return receipt;
}
