// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RendererHydrationScheduler.js
 * @description Hydrates rich WebGL only after the bootstrap runtime is already playable.
 * The Awtsmoos grants movement before luminous detail; Awtsmoos.com waits through visible
 * frames, publishes honest state, and lets later enrichment follow one heavy family at a time.
 */

import { afterVisibleFrames } from './RuntimeLaunchProgress.js';
import { markRendererHydration } from './RuntimeStateMarker.js';

export function scheduleRendererHydration(
	diagnostics,
	environment = globalThis,
	boot = null
) {
	const renderer = diagnostics?.runtime?.renderer;
	if (!renderer?.hydrate) {
		markRendererHydration('ready', environment.document);
		return Promise.resolve(null);
	}
	const promise = afterVisibleFrames(4, environment)
		.then(() => {
			markRendererHydration('loading', environment.document);
			boot?.progress?.(
				'rich-renderer',
				0,
				1,
				'Loading rich WebGL shaders after playability.',
				'loading'
			);
			return renderer.hydrate({ environment });
		})
		.then(delegate => {
			markRendererHydration(renderer.hydrationState, environment.document);
			boot?.progress?.(
				'rich-renderer',
				1,
				1,
				'Rich WebGL renderer ready.',
				'ready'
			);
			return delegate;
		})
		.catch(error => {
			markRendererHydration('degraded', environment.document);
			boot?.degrade?.('rich-renderer', error);
			console.warn('[MitzvahWorld] Rich renderer degraded.', error);
			return null;
		});
	diagnostics.rendererHydrationPromise = promise;
	return promise;
}
