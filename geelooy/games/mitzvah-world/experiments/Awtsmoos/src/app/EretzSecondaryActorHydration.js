// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EretzSecondaryActorHydration.js
 * @description Delays combat, horses, doors, lava, shadows, targeting, and interior systems until friendly life is already visible.
 * The Awtsmoos lets the village breathe before distant challenge and machinery enter their appointed frame;
 * Awtsmoos.com preserves every secondary system while separating its heavier revelation from the first human name.
 */

import { afterVisibleFrames } from './RuntimeLaunchProgress.js';

export function startEretzSecondaryActorHydration(runtime, options = {}, boot = null) {
	if (runtime.secondaryActorHydrationPromise) {
		return runtime.secondaryActorHydrationPromise;
	}
	const promise = hydrateSecondaryActors(runtime, options, boot);
	runtime.secondaryActorHydrationPromise = promise;
	return promise;
}

async function hydrateSecondaryActors(runtime, options, boot) {
	const environment = options.environment || globalThis;
	await delayedStart(options.secondaryActorStreamingDelayMs ?? 6000, environment);
	await afterVisibleFrames(2, environment);
	if (runtime.destroyed) return null;
	const systems = await loadSystems(options);
	if (runtime.destroyed) return null;
	const hostileNpcs = systems.createEretzHostilePopulation(runtime);
	await afterVisibleFrames(1, environment);
	const doors = systems.createEretzDoors(runtime, runtime.state);
	await afterVisibleFrames(1, environment);
	const horses = systems.createEretzHorseHerd(runtime);
	const targetCoordinator = systems.createEretzTargetCoordinator(
		runtime,
		runtime.friendlyNpcs,
		hostileNpcs
	);
	const lava = new systems.LavaLevel(runtime.scene, runtime.assets);
	const shadows = new systems.SunShadowProjector(runtime.scene);
	const worldMode = createWorldMode(runtime, systems, {
		doors,
		horses,
		hostileNpcs,
		lava
	});
	const houseVisibility = systems.createHouseVisibilitySystem({
		doors,
		houses: runtime.terrain.worldMetadata.houses || [],
		root: runtime.terrain.group
	}, runtime.state);
	Object.assign(runtime, {
		doors,
		horses,
		hostileNpcs,
		houseVisibility,
		lava,
		shadows,
		targetCoordinator,
		worldMode,
		worldActorsReady: true
	});
	boot?.progress?.('world-actor-stream', 1, 1, 'Secondary world actors are ready.', 'ready');
	return Object.freeze({
		doors: doors.length,
		horses: horses.horses?.length || 0,
		hostile: hostileNpcs.actors.length,
		status: 'ready'
	});
}

async function loadSystems(options) {
	if (options.loadSecondaryActorSystems) {
		return options.loadSecondaryActorSystems();
	}
	const [factories, lava, shadows, mode, visibility] = await Promise.all([
		import('./EretzActorFactories.js?v=20260820-secondary-actors-01'),
		import('../world/LavaLevel.js?v=20260820-secondary-actors-01'),
		import('../world/SunShadowProjector.js?v=20260820-secondary-actors-01'),
		import('../world/WorldModeManager.js?v=20260820-secondary-actors-01'),
		import('../world/visibility/HouseVisibilitySystem.js?v=20260820-secondary-actors-01')
	]);
	return { ...factories, ...lava, ...shadows, ...mode, ...visibility };
}

function createWorldMode(runtime, systems, actors) {
	return new systems.WorldModeManager({
		eretzCollision: runtime.collisionQuery,
		footOffset: runtime.footOffset,
		ground: runtime.ground,
		lava: actors.lava,
		mainGroup: runtime.terrain.group,
		mainObjects: [
			runtime.friendlyNpcs?.group,
			actors.hostileNpcs.group,
			actors.horses.group,
			...actors.doors.map(door => door.mesh)
		].filter(Boolean),
		mover: runtime.mover,
		state: runtime.state
	}).rememberMainHeight(runtime.terrain.heightAt);
}

function delayedStart(milliseconds, environment) {
	return new Promise(resolve => {
		const timer = environment?.setTimeout || setTimeout;
		timer(resolve, milliseconds);
	});
}
