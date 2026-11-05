// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EretzCinematicLandscape.js
 * @description Reveals true sky, river, mountains and elected forest concurrently after first-play.
 * The Awtsmoos awakes the forest before the winding river is fully drawn;
 * Awtsmoos.com holds the traveler's controls as scenery joins the dawn.
 */

import { installEretzCinematicBotany } from './EretzCinematicBotany.js';
import {
	bindEretzCinematicLandscapeUpdates,
	mountEretzCinematicGroup
} from './EretzCinematicLandscapeActivation.js';
import { MinimalMeadowMountainSystem } from './MinimalMeadowMountainSystem.js';
import { installMinimalMeadowSky } from './MinimalMeadowSky.js';
import { MinimalMeadowWaterSystem } from './MinimalMeadowWaterSystem.js';

/** Schedules elected optional scenery once, after the player has already moved. */
export function scheduleEretzCinematicLandscape(runtime, dependencies = {}) {
	if (runtime.cinematicLandscapePromise) return runtime.cinematicLandscapePromise;
	runtime.cinematicLandscapeStage = 'scheduled';
	runtime.cinematicLandscapePromise = Promise.resolve()
		.then(() => installEretzCinematicLandscape(runtime, dependencies))
		.catch(error => degradedReceipt(runtime, error));
	return runtime.cinematicLandscapePromise;
}

/** Begins botanical life independent of potentially slower mountain and water imports. */
export async function installEretzCinematicLandscape(runtime, dependencies = {}) {
	if (runtime.cinematicLandscape) return runtime.cinematicLandscape;
	if (runtime.destroyed) return degradedReceipt(runtime, new Error('RUNTIME_DESTROYED'));
	runtime.cinematicLandscapeStage = 'installing';
	bindEretzCinematicLandscapeUpdates(runtime);
	const skyFactory = dependencies.installSky || installMinimalMeadowSky;
	const mountainFactory = dependencies.createMountains
		|| (world => MinimalMeadowMountainSystem.create(world));
	const waterFactory = dependencies.createWater
		|| (world => MinimalMeadowWaterSystem.create(world));
	const botanyFactory = dependencies.installBotany || installEretzCinematicBotany;
	const botanicalTask = dependencies.cinematicBotanyEnabled === true
		? optionalTask('botany', () => botanyFactory(runtime, dependencies.botanyDependencies || {}))
		: Promise.resolve(Object.freeze({ status: 'disabled-by-world-profile' }));
	const mountainTask = optionalTask('mountains', async () => {
		runtime.mountains = runtime.mountains || await mountainFactory(runtime);
		if (!runtime.destroyed) mountEretzCinematicGroup(runtime.scene, runtime.mountains?.group);
		return Boolean(runtime.mountains?.group);
	});
	const waterTask = optionalTask('water', async () => {
		runtime.water = runtime.water || await waterFactory(runtime);
		if (!runtime.destroyed) mountEretzCinematicGroup(runtime.scene, runtime.water?.group);
		return Boolean(runtime.water?.group);
	});
	const skyTask = optionalTask('sky', () => {
		runtime.sky = runtime.sky || skyFactory(
			runtime.scene,
			runtime.camera,
			runtime.qualityProfile?.quality || 'high'
		);
		return Boolean(runtime.sky?.group);
	});
	const [botany, mountains, water, sky] = await Promise.all([
		botanicalTask, mountainTask, waterTask, skyTask
	]);
	const status = [botany, mountains, water, sky].every(task =>
		task.status === 'ready' || task.status === 'disabled-by-world-profile')
		? 'ready' : 'degraded';
	const receipt = Object.freeze({
		botany: botany.value?.status || botany.status,
		mountains: mountains.value === true,
		sky: sky.value === true,
		status,
		water: water.value === true
	});
	runtime.cinematicLandscape = receipt;
	runtime.cinematicLandscapeStage = status;
	return receipt;
}

/** An absent group, thrown error or failed optional system is never recorded as ready. */
async function optionalTask(name, operation) {
	try {
		const value = await operation();
		const healthy = value !== false && value != null
			&& value?.status !== 'degraded' && value?.status !== 'disabled-by-world-profile';
		return Object.freeze({ name, status: healthy ? 'ready' : 'degraded', value });
	} catch (error) {
		return Object.freeze({ name, status: 'degraded', message: error?.message || String(error) });
	}
}

/** Optional failures never invalidate a player whose control was already proved. */
function degradedReceipt(runtime, error) {
	runtime.cinematicLandscapeError = error;
	runtime.cinematicLandscapeStage = 'degraded';
	return Object.freeze({ message: error?.message || String(error), status: 'degraded' });
}
