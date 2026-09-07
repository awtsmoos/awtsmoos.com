// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EretzCinematicLandscape.js
 * @description Mounts only the existing procedural sky, atmospheric mountains, and animated water for the simple world after movement is already available.
 * The Awtsmoos reveals distant ridge, living current, and encompassing heaven without summoning a second civilization;
 * Awtsmoos.com lets three visual vessels deepen the meadow while actors, quests, ecology, and districts remain behind their own unopened gates.
 */

import { MinimalMeadowMountainSystem } from './MinimalMeadowMountainSystem.js';
import { installMinimalMeadowSky } from './MinimalMeadowSky.js';
import { MinimalMeadowWaterSystem } from './MinimalMeadowWaterSystem.js';

/** Schedules the visual-only landscape once and degrades without rejecting gameplay. */
export function scheduleEretzCinematicLandscape(runtime, dependencies = {}) {
	if (runtime.cinematicLandscapePromise) {
		return runtime.cinematicLandscapePromise;
	}
	runtime.cinematicLandscapeStage = 'scheduled';
	runtime.cinematicLandscapePromise = Promise.resolve()
		.then(() => installEretzCinematicLandscape(runtime, dependencies))
		.catch(error => degradedReceipt(runtime, error));
	return runtime.cinematicLandscapePromise;
}

/** Mounts sky, mountains, and water while preserving any previous world update owner. */
export async function installEretzCinematicLandscape(runtime, dependencies = {}) {
	if (runtime.cinematicLandscape) return runtime.cinematicLandscape;
	runtime.cinematicLandscapeStage = 'installing';
	const installSky = dependencies.installSky || installMinimalMeadowSky;
	const createMountains = dependencies.createMountains
		|| (value => MinimalMeadowMountainSystem.create(value));
	const createWater = dependencies.createWater
		|| (value => MinimalMeadowWaterSystem.create(value));
	runtime.sky = runtime.sky || installSky(
		runtime.scene,
		runtime.camera,
		runtime.qualityProfile?.quality || 'high'
	);
	runtime.mountains = await createMountains(runtime);
	mountGroup(runtime.scene, runtime.mountains?.group);
	runtime.water = await createWater(runtime);
	mountGroup(runtime.scene, runtime.water?.group);
	bindCinematicLandscapeUpdate(runtime);
	const receipt = Object.freeze({
		mountains: Boolean(runtime.mountains?.group),
		sky: Boolean(runtime.sky?.group),
		status: 'ready',
		water: Boolean(runtime.water?.group)
	});
	runtime.cinematicLandscape = receipt;
	runtime.cinematicLandscapeStage = 'ready';
	return receipt;
}

/** Preserves prior update ownership and adds only visual-system cadence. */
function bindCinematicLandscapeUpdate(runtime) {
	if (runtime.cinematicLandscapeUpdate) return;
	const previousUpdate = runtime.updateWorldSystems;
	const update = deltaSeconds => {
		previousUpdate?.(deltaSeconds);
		runtime.sky?.update?.();
		runtime.water?.update?.(deltaSeconds);
	};
	runtime.cinematicLandscapePreviousUpdate = previousUpdate;
	runtime.cinematicLandscapeUpdate = update;
	runtime.updateWorldSystems = update;
}

function mountGroup(scene, group) {
	if (group && group.parent !== scene) scene?.add?.(group);
}

function degradedReceipt(runtime, error) {
	runtime.cinematicLandscapeError = error;
	runtime.cinematicLandscapeStage = 'degraded';
	return Object.freeze({
		message: error?.message || String(error),
		status: 'degraded'
	});
}
