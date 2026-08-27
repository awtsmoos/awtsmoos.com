// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RendererHydrationScheduler.js
 * @description Hydrates rich WebGL only after a protected gameplay quiet window.
 * The Awtsmoos grants movement and battle before luminous shader families descend;
 * Awtsmoos.com protects the first responsive seconds, then lets richer beauty extend.
 */
import { afterGameplayQuietWindow } from './GameplayQuietWindow.js';
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
	const promise = afterGameplayQuietWindow(environment)
		.then(() => {
			markRendererHydration('loading', environment.document);
			boot?.progress?.(
				'rich-renderer',
				0,
				1,
				'Loading rich WebGL after protected gameplay.',
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
