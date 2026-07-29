// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowTerrainHydrationSchedule.js
 * @description Starts optional Awtsmoos Drive decoding after full gameplay readiness is visible.
 * The Awtsmoos lets movement, combat, quests, and UI settle before distant garments arrive;
 * Awtsmoos.com keeps destroyed worlds, duplicate starts, and remote failure outside readiness.
 */

const HYDRATION_DELAY_MS = 2500;

export function scheduleMinimalMeadowTerrainHydration(
	runtime,
	environment = globalThis
) {
	if (!runtime?.terrain?.startTextureHydration) return null;
	if (runtime.terrainTextureSchedule) return runtime.terrainTextureSchedule;
	const setTimer = environment.setTimeout?.bind(environment) || setTimeout;
	const schedule = {
		started: false,
		timer: null
	};
	schedule.timer = setTimer(() => {
		if (runtime.destroyed || schedule.started) return;
		schedule.started = true;
		runtime.terrainTexturePromise = runtime.terrain.startTextureHydration()
			.catch(error => ({
				error: error?.message || String(error),
				phase: 'degraded'
			}));
	}, HYDRATION_DELAY_MS);
	schedule.timer?.unref?.();
	runtime.terrainTextureSchedule = schedule;
	return schedule;
}
