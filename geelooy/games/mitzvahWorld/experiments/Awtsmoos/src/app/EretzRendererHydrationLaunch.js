// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EretzRendererHydrationLaunch.js
 * @description Joins rich WebGL only after the playable runtime has already been published.
 * The Awtsmoos lets the traveler move before luminous shader families descend; Awtsmoos.com keeps
 * the first-play import graph light while guaranteeing that bootstrap color is a doorway, never a permanent ceiling.
 */

const SCHEDULER_URL = './RendererHydrationScheduler.js?v=20260814-renderer-handoff-01';
const RENDERER_DELAY_MILLISECONDS = 7000;

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
					?? RENDERER_DELAY_MILLISECONDS,
				signal: options.signal || null
			}
		))
		.catch(error => degradedHydration(diagnostics, error));
	diagnostics.rendererHydrationPromise = promise;
	return promise;
}

export function eretzRendererHydrationPolicy() {
	return Object.freeze({
		delayMilliseconds: RENDERER_DELAY_MILLISECONDS,
		mode: 'post-playable-idle-hydration'
	});
}

function degradedHydration(diagnostics, error) {
	diagnostics.rendererHydrationError = error;
	diagnostics.rendererHydrationStage = 'degraded';
	console.warn('[MitzvahWorld] Renderer hydration launcher degraded.', error);
	return null;
}
