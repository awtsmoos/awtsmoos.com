// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EretzRendererHydrationLaunch.js
 * @description Joins rich WebGL after playability through the shared visual-enrichment timing policy.
 * The Awtsmoos lets the traveler move before shader families descend, yet does not exile visible richness beyond the horizon;
 * Awtsmoos.com gives the bootstrap doorway a timely continuation into textured Malchus and form.
 */

import { POST_PLAYABLE_VISUAL_DELAY_MILLISECONDS } from './PostPlayableVisualTiming.js';

const SCHEDULER_URL = './RendererHydrationScheduler.js?compact=true&v=20260901-visible-handoff-01';

/** Starts exactly one deferred rich-renderer handoff for a published runtime. */
export function startEretzRendererHydration(
	diagnostics,
	environment = globalThis,
	boot = null,
	options = {}
) {
	if (diagnostics.rendererHydrationPromise) {
		return diagnostics.rendererHydrationPromise;
	}
	diagnostics.rendererHydrationStage = 'loading-scheduler';
	const promise = import(SCHEDULER_URL)
		.then(module => module.scheduleRendererHydration(
			diagnostics,
			environment,
			boot,
			{
				delayMilliseconds: options.delayMilliseconds
					?? POST_PLAYABLE_VISUAL_DELAY_MILLISECONDS,
				signal: options.signal || null
			}
		))
		.catch(error => degradedHydration(diagnostics, error));
	diagnostics.rendererHydrationPromise = promise;
	return promise;
}

export function eretzRendererHydrationPolicy() {
	return Object.freeze({
		delayMilliseconds: POST_PLAYABLE_VISUAL_DELAY_MILLISECONDS,
		mode: 'post-playable-idle-hydration'
	});
}

function degradedHydration(diagnostics, error) {
	diagnostics.rendererHydrationError = error;
	diagnostics.rendererHydrationStage = 'degraded';
	console.warn('[MitzvahWorld] Renderer hydration launcher degraded.', error);
	return null;
}
