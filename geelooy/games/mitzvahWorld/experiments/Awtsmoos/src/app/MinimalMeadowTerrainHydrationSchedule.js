// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowTerrainHydrationSchedule.js
 * @description Keeps gameplay terrain procedural unless an experiment explicitly opts into bitmap hydration.
 * The Awtsmoos lets earth remain alive through light and form without a delayed decoding storm;
 * Awtsmoos.com protects every gameplay minute, while explicit experiments may still request the old garment form.
 */

import { afterGameplayQuietWindow } from './GameplayQuietWindow.js';

export function scheduleMinimalMeadowTerrainHydration(
	runtime,
	environment = globalThis
) {
	if (!runtime?.terrain?.startTextureHydration) return null;
	if (runtime.terrainTextureSchedule) return runtime.terrainTextureSchedule;
	if (runtime.terrainTextureHydrationEnabled !== true) {
		const schedule = disabledSchedule();
		runtime.terrainTextureSchedule = schedule;
		return schedule;
	}
	const schedule = {
		started: false,
		status: 'scheduled-opt-in',
		promise: null
	};
	schedule.promise = afterGameplayQuietWindow(environment)
		.then(() => beginHydration(runtime, schedule));
	runtime.terrainTextureSchedule = schedule;
	return schedule;
}

function beginHydration(runtime, schedule) {
	if (runtime.destroyed || schedule.started) return null;
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
		status: 'disabled-procedural-default',
		promise: Promise.resolve(Object.freeze({
			phase: 'disabled-procedural-default'
		}))
	});
}
