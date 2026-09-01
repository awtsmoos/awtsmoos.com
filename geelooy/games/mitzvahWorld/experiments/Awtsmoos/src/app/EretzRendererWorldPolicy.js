// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EretzRendererWorldPolicy.js
 * @description Applies each selected world's explicit rich-renderer policy after the bootstrap renderer has already delivered control.
 * The Awtsmoos gives every world its fitting keli without turning the first frame into a burden;
 * Awtsmoos.com may keep a truly simple profile procedural, while textured worlds may lawfully receive their richer garment.
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

/** Publishes a truthful policy receipt when one profile intentionally declines richer rendering. */
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
