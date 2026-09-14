//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file EretzRendererWorldPolicy.js
 * @description Applies world renderer policy without confusing policy-loading promises with actual renderer hydration.
 * Canonical worlds normally arrive here already rich-renderer-ready because essential visuals are now a pre-play gate.
 */

import { startEretzRendererHydration } from './EretzRendererHydrationLaunch.js';
import { markRendererHydration } from './RuntimeStateMarker.js';

/** Starts, acknowledges, or explicitly disables rich renderer hydration for the selected world. */
export function startEretzRendererByWorldPolicy(
	diagnostics,
	environment = globalThis,
	boot = null,
	options = {}
) {
	if (options.worldExperience?.richRenderer === false) {
		return disableRichRenderer(diagnostics, environment);
	}
	const renderer = diagnostics?.runtime?.renderer;
	if (renderer?.hydrationState === 'ready' && renderer.delegate) {
		return acknowledgeReadyRenderer(diagnostics, renderer, environment);
	}
	diagnostics.richRenderer = 'deferred';
	markRendererHydration('deferred', environment.document);
	return startEretzRendererHydration(diagnostics, environment, boot, {
		signal: options.signal || null
	});
}

function acknowledgeReadyRenderer(diagnostics, renderer, environment) {
	diagnostics.richRenderer = 'ready-before-playable';
	diagnostics.rendererHydrationStage = 'ready';
	markRendererHydration('ready', environment.document);
	const receipt = Promise.resolve(renderer.delegate);
	diagnostics.rendererHydrationPromise = receipt;
	return receipt;
}
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
