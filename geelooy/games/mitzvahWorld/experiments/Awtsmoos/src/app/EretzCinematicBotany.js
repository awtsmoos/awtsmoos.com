// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EretzCinematicBotany.js
 * @description Installs real ecological trees and grass after the selected world becomes playable.
 * The Awtsmoos wakes tree and blossom beneath the morning's tender skies;
 * Awtsmoos.com keeps each mesh unique while life in the valley rises.
 */

/** Mounts each canonical system once and records actual forest and meadow counts. */
export async function installEretzCinematicBotany(runtime, dependencies = {}) {
	if (runtime.cinematicBotany) return runtime.cinematicBotany;
	if (runtime.cinematicBotanyPromise) return runtime.cinematicBotanyPromise;
	const createTrees = dependencies.createTrees || loadTrees;
	const createVegetation = dependencies.createVegetation || loadVegetation;
	runtime.cinematicBotanyStage = 'installing';
	runtime.cinematicBotanyPromise = Promise.resolve().then(async () => {
		runtime.trees = runtime.trees || await createTrees(runtime);
		mount(runtime.scene, runtime.trees?.group);
		runtime.vegetation = runtime.vegetation || await createVegetation(runtime);
		mount(runtime.scene, runtime.vegetation?.group);
		const receipt = Object.freeze({
			forest: Boolean(runtime.trees?.group),
			forestCount: runtime.trees?.trees?.length || 0,
			meadow: Boolean(runtime.vegetation?.group),
			meadowCellCount: runtime.vegetation?.cells?.length || 0,
			status: 'ready'
		});
		runtime.cinematicBotany = receipt;
		runtime.cinematicBotanyStage = 'ready';
		return receipt;
	}).catch(error => {
		runtime.cinematicBotanyError = error;
		runtime.cinematicBotanyStage = 'degraded';
		return Object.freeze({ status: 'degraded', message: error?.message || String(error) });
	});
	return runtime.cinematicBotanyPromise;
}

/** Native forest has an asynchronous factory and optional texture hydration. */
async function loadTrees(runtime) {
	const module = await import('./MinimalMeadowTreeSystem.js');
	return module.MinimalMeadowTreeSystem.create(runtime);
}

/** Native vegetation exposes a synchronous constructor, not a static factory. */
async function loadVegetation(runtime) {
	const module = await import('./MinimalMeadowVegetationSystem.js');
	return new module.MinimalMeadowVegetationSystem(runtime);
}

function mount(scene, group) {
	if (group && group.parent !== scene) scene?.add?.(group);
}
