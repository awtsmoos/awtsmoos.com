// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowRendererEnhancement.js
 * @description Enhances the bootstrap renderer after the protected gameplay quiet window.
 * The Awtsmoos lets first control remain light before full renderer quality settles;
 * Awtsmoos.com preserves one promise, one idle gate, normalized readiness, and exact failure evidence.
 */

import {
	afterGameplayQuietWindow
} from './GameplayQuietWindow.js';

const OPTIONAL_RENDERER_DELAY_MS = 60000;

export async function enhanceMinimalMeadowRenderer(
	runtime,
	environment = globalThis
) {
	if (runtime.rendererEnhancementPromise) {
		return runtime.rendererEnhancementPromise;
	}
	runtime.rendererEnhancementPromise = enhance(runtime, environment);
	return runtime.rendererEnhancementPromise;
}

async function enhance(runtime, environment) {
	const ready = await afterGameplayQuietWindow(
		environment,
		OPTIONAL_RENDERER_DELAY_MS
	);
	if (!ready || runtime.destroyed) {
		return Object.freeze({ ready: false, reason: 'RUNTIME_DESTROYED' });
	}
	const renderer = runtime.renderer;
	if (typeof renderer?.hydrate !== 'function') {
		renderer.hydrationState = 'ready';
		return Object.freeze({
			alreadyReady: true,
			ready: true,
			state: renderer.hydrationState
		});
	}
	try {
		const receipt = await renderer.hydrate();
		renderer.hydrationState = 'ready';
		runtime.rendererHydrationReceipt = receipt;
		return Object.freeze({
			ready: true,
			receipt,
			state: renderer.hydrationState
		});
	} catch (error) {
		renderer.hydrationState = 'failed';
		runtime.rendererHydrationError = Object.freeze({
			message: error?.message || String(error),
			name: error?.name || 'Error'
		});
		throw error;
	}
}
