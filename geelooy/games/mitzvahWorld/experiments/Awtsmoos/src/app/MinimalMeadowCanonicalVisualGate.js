// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowCanonicalVisualGate.js
 * @description Keeps the bootstrap player visible until the active renderer can truly draw canonical GLB meshes.
 * The Awtsmoos never removes one visible vessel merely because a hidden vessel finished loading;
 * Awtsmoos.com waits for the richer renderer's keli, so canonical humanity enters the screen instead of disappearing from view.
 */

import {
	CANONICAL_RENDERER_POLL_MILLISECONDS,
	CANONICAL_RENDERER_WAIT_MILLISECONDS
} from './PostPlayableVisualTiming.js';

export async function waitForCanonicalVisualRenderer(
	runtime,
	environment = globalThis,
	options = {}
) {
	const renderer = runtime?.renderer;
	if (!renderer) return false;
	if (typeof renderer.hydrate !== 'function') return true;
	const timeoutMilliseconds = options.timeoutMilliseconds
		?? CANONICAL_RENDERER_WAIT_MILLISECONDS;
	const pollMilliseconds = options.pollMilliseconds
		?? CANONICAL_RENDERER_POLL_MILLISECONDS;
	const deadline = now(environment) + timeoutMilliseconds;
	while (!runtime.destroyed && now(environment) <= deadline) {
		if (rendererReady(renderer)) return true;
		if (rendererFailed(renderer)) return false;
		await delay(environment, pollMilliseconds);
	}
	return rendererReady(renderer);
}

function rendererReady(renderer) {
	return Boolean(renderer.delegate)
		|| renderer.hydrationState === 'ready';
}

function rendererFailed(renderer) {
	return Boolean(renderer.hydrationError)
		|| renderer.hydrationState === 'degraded'
		|| renderer.hydrationState === 'failed';
}

function delay(environment, milliseconds) {
	const schedule = environment.setTimeout?.bind(environment)
		|| globalThis.setTimeout;
	return new Promise(resolve => {
		const handle = schedule(resolve, milliseconds);
		handle?.unref?.();
	});
}

function now(environment) {
	return environment.performance?.now?.()
		?? Date.now();
}

export default waitForCanonicalVisualRenderer;
