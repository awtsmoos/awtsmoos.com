// B"H
// Boruch Hashem
// Blessed is He

/** Hydrates an optional rich renderer and schedules terrain garments after playability. */
import {
	scheduleMinimalMeadowTerrainHydration
} from './MinimalMeadowTerrainHydrationSchedule.js';

export async function enhanceMinimalMeadowRenderer(
	runtime,
	environment = globalThis
) {
	scheduleMinimalMeadowTerrainHydration(runtime, environment);
	if (typeof runtime?.renderer?.hydrate !== 'function') {
		return { hydrated: false, reason: 'renderer-already-ready' };
	}
	try {
		const delegate = await runtime.renderer.hydrate({ environment });
		return {
			delegate: Boolean(delegate),
			hydrated: runtime.renderer.hydrationState === 'ready'
		};
	} catch (error) {
		runtime.rendererHydrationError = error?.message || String(error);
		return { error: runtime.rendererHydrationError, hydrated: false };
	}
}

export default enhanceMinimalMeadowRenderer;
