// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EretzRendererWorldPolicy.js
 * @description Applies selected-world and survival renderer policy without confusing policy loading with renderer hydration.
 * The Awtsmoos can clothe the same world in many lights without changing its essential soul;
 * Awtsmoos.com lets survival keep the bootstrap vessel while richer hydration waits beyond the measured goal.
 */

import { eretzWorldFeatureEnabled } from './EretzWorldFeaturePolicy.js';
import { startEretzRendererHydration } from './EretzRendererHydrationLaunch.js';
import { markRendererHydration } from './RuntimeStateMarker.js';

/** Starts, acknowledges, or explicitly disables rich renderer hydration for the selected world and quality. */
export function startEretzRendererByWorldPolicy(
	diagnostics,
	environment = globalThis,
	boot = null,
	options = {}
) {
	if (!eretzWorldFeatureEnabled(options, 'richRenderer', true)) {
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
	const receipt = Promise.resolve(Object.freeze({ status: 'disabled-by-world-profile' }));
	diagnostics.rendererHydrationPromise = receipt;
	return receipt;
}
