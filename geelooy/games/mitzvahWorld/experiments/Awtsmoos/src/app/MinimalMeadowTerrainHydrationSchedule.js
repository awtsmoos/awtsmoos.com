// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowTerrainHydrationSchedule.js
 * @description Begins optional terrain texture decoding only after protected gameplay time.
 * The Awtsmoos lets movement, combat, quests, and UI breathe before distant garments arrive;
 * Awtsmoos.com preserves responsive play, then lets textured earth awaken and thrive.
 */
import { afterGameplayQuietWindow } from './GameplayQuietWindow.js';

export function scheduleMinimalMeadowTerrainHydration(
	runtime,
	environment = globalThis
) {
	if (!runtime?.terrain?.startTextureHydration) return null;
	if (runtime.terrainTextureSchedule) return runtime.terrainTextureSchedule;
	const schedule = {
		started: false,
		promise: null
	};
	schedule.promise = afterGameplayQuietWindow(environment)
		.then(() => {
			if (runtime.destroyed || schedule.started) return null;
			schedule.started = true;
			runtime.terrainTexturePromise = runtime.terrain.startTextureHydration()
				.catch(error => ({
					error: error?.message || String(error),
					phase: 'degraded'
				}));
			return runtime.terrainTexturePromise;
		});
	runtime.terrainTextureSchedule = schedule;
	return schedule;
}
