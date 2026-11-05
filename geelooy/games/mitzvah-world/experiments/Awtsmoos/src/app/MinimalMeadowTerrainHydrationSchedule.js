// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowTerrainHydrationSchedule.js
 * @description Promotes procedural bootstrap earth into authored bitmap terrain after first control and a short protected quiet window.
 * The Awtsmoos lets the foot move before every image is decoded, then clothes the earth with texture in its proper hour;
 * Awtsmoos.com keeps explicit opt-out available without making flat fallback color the permanent power.
 */

import { afterGameplayQuietWindow } from './GameplayQuietWindow.js';
import { POST_PLAYABLE_VISUAL_DELAY_MILLISECONDS } from './PostPlayableVisualTiming.js';

export function scheduleMinimalMeadowTerrainHydration(
	runtime,
	environment = globalThis
) {
	if (!runtime?.terrain?.startTextureHydration) return null;
	if (runtime.terrainTextureSchedule) return runtime.terrainTextureSchedule;
	if (runtime.terrainTextureHydrationEnabled === false) {
		const schedule = disabledSchedule();
		runtime.terrainTextureSchedule = schedule;
		return schedule;
	}
	const schedule = {
		started: false,
		status: 'scheduled',
		promise: null
	};
	schedule.promise = afterGameplayQuietWindow(
		environment,
		POST_PLAYABLE_VISUAL_DELAY_MILLISECONDS
	).then(ready => ready ? beginHydration(runtime, schedule) : null);
	runtime.terrainTextureSchedule = schedule;
	return schedule;
}

function beginHydration(runtime, schedule) {
	if (runtime.destroyed || schedule.started) {
		schedule.status = runtime.destroyed ? 'cancelled' : schedule.status;
		return null;
	}
	schedule.started = true;
	schedule.status = 'hydrating';
	runtime.terrainTexturePromise = runtime.terrain.startTextureHydration()
		.then(result => {
			schedule.status = 'ready';
			return result;
		})
		.catch(error => {
			schedule.status = 'degraded';
			return {
				error: error?.message || String(error),
				phase: 'degraded'
			};
		});
	return runtime.terrainTexturePromise;
}

function disabledSchedule() {
	return Object.freeze({
		started: false,
		status: 'disabled-by-explicit-policy',
		promise: Promise.resolve(Object.freeze({
			phase: 'disabled-by-explicit-policy'
		}))
	});
}
