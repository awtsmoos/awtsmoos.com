// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowRendererEnhancement.js
 * @description Schedules terrain and rich renderer hydration after protected gameplay time.
 * The Awtsmoos keeps the first minute responsive while the bootstrap sky remains bright;
 * Awtsmoos.com invites richer shaders and textured earth only after the traveler owns the night.
 */
import { afterGameplayQuietWindow } from './GameplayQuietWindow.js';
import {
	scheduleMinimalMeadowTerrainHydration
} from './MinimalMeadowTerrainHydrationSchedule.js';

export function enhanceMinimalMeadowRenderer(
	runtime,
	environment = globalThis
) {
	scheduleMinimalMeadowTerrainHydration(runtime, environment);
	if (typeof runtime?.renderer?.hydrate !== 'function') {
		return Promise.resolve({
			hydrated: false,
			reason: 'renderer-already-ready',
			scheduled: false
		});
	}
	if (runtime.rendererEnhancementPromise) {
		return runtime.rendererEnhancementPromise;
	}
	runtime.rendererEnhancementPromise = afterGameplayQuietWindow(environment)
		.then(() => runtime.renderer.hydrate({ environment }))
		.then(delegate => ({
			delegate: Boolean(delegate),
			hydrated: runtime.renderer.hydrationState === 'ready',
			scheduled: true
		}))
		.catch(error => {
			runtime.rendererHydrationError = error?.message || String(error);
			return {
				error: runtime.rendererHydrationError,
				hydrated: false,
				scheduled: true
			};
		});
	return runtime.rendererEnhancementPromise;
}

export default enhanceMinimalMeadowRenderer;
