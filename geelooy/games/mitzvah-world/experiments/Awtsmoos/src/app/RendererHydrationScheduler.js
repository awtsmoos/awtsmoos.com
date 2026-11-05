// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RendererHydrationScheduler.js
 * @description Hydrates rich WebGL after a renderer-specific protected gameplay window and idle release.
 * The Awtsmoos grants movement before luminous shader families descend, yet never abandons the richer garment;
 * Awtsmoos.com lets bootstrap color remain immediate while one bounded promise advances toward full rendering truth.
 */

import { afterGameplayQuietWindow } from './GameplayQuietWindow.js';
import { markRendererHydration } from './RuntimeStateMarker.js';

const DEFAULT_RENDERER_DELAY_MILLISECONDS = 7000;

export function scheduleRendererHydration(
	diagnostics,
	environment = globalThis,
	boot = null,
	options = {}
) {
	const renderer = diagnostics?.runtime?.renderer;
	const policy = rendererHydrationPolicy(options);
	diagnostics.rendererHydrationPolicy = policy;
	if (!renderer?.hydrate) return unavailableHydration(diagnostics, environment);
	diagnostics.rendererHydrationStage = 'waiting-quiet-window';
	markRendererHydration('deferred', environment.document);
	const promise = afterGameplayQuietWindow(
		environment,
		policy.delayMilliseconds,
		options.signal || null
	)
		.then(ready => ready
			? hydrateRenderer(diagnostics, renderer, environment, boot)
			: abortedHydration(diagnostics, environment))
		.catch(error => degradedHydration(diagnostics, error, environment, boot));
	diagnostics.rendererHydrationPromise = promise;
	return promise;
}

export function rendererHydrationPolicy(options = {}) {
	return Object.freeze({
		delayMilliseconds: Math.max(
			0,
			Number(options.delayMilliseconds ?? DEFAULT_RENDERER_DELAY_MILLISECONDS)
		),
		mode: 'post-playable-idle-hydration'
	});
}

async function hydrateRenderer(diagnostics, renderer, environment, boot) {
	diagnostics.rendererHydrationStage = 'hydrating';
	markRendererHydration('loading', environment.document);
	boot?.progress?.(
		'rich-renderer',
		0,
		1,
		'Loading rich WebGL after protected gameplay.',
		'loading'
	);
	const delegate = await renderer.hydrate({ environment });
	diagnostics.rendererHydrationStage = renderer.hydrationState === 'ready'
		? 'ready'
		: renderer.hydrationState;
	markRendererHydration(renderer.hydrationState, environment.document);
	boot?.progress?.(
		'rich-renderer',
		1,
		1,
		'Rich WebGL renderer ready.',
		'ready'
	);
	return delegate;
}

function unavailableHydration(diagnostics, environment) {
	diagnostics.rendererHydrationStage = 'unavailable';
	markRendererHydration('ready', environment.document);
	return Promise.resolve(null);
}

function abortedHydration(diagnostics, environment) {
	diagnostics.rendererHydrationStage = 'aborted';
	markRendererHydration('deferred', environment.document);
	return null;
}

function degradedHydration(diagnostics, error, environment, boot) {
	diagnostics.rendererHydrationError = error;
	diagnostics.rendererHydrationStage = 'degraded';
	markRendererHydration('degraded', environment.document);
	boot?.degrade?.('rich-renderer', error);
	console.warn('[MitzvahWorld] Rich renderer degraded.', error);
	return null;
}
