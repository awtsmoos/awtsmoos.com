// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EretzWorldActorHydration.js
 * @description Streams world actor families after movement without blocking menu departure.
 * The Awtsmoos brings each family in its hour; Awtsmoos.com yields between friendly people,
 * enemies, doors, horses, lava, shadows, targeting, and interior visibility.
 */

import { afterVisibleFrames } from './RuntimeLaunchProgress.js';

export function startEretzWorldActorHydration(runtime, options = {}, boot = null) {
	if (runtime.worldActorHydrationPromise) return runtime.worldActorHydrationPromise;
	runtime.worldActorHydrationPromise = scheduleHydration(runtime, options, boot);
	return runtime.worldActorHydrationPromise;
}

async function scheduleHydration(runtime, options, boot) {
	await delayedStart(options.worldActorStreamingDelayMs ?? 2500, options.environment || globalThis);
	try {
		const systems = await loadSystems();
		const hydrated = await hydrateFamilies(runtime, systems, options, boot);
		runtime.worldActorsReady = true;
		runtime.worldActorHydrationResult = hydrated;
		return hydrated;
	} catch (error) {
		boot?.degrade?.('world-actor-stream', error);
		console.warn('[MitzvahWorld] Optional world actors degraded.', error);
		return null;
	}
}

async function hydrateFamilies(runtime, systems, options, boot) {
	const environment = options.environment || globalThis;
	const friendlyNpcs = systems.createEretzNpcPopulation(runtime);
	await reveal(environment, boot, 'Friendly neighbors entered the village.', 0.2);
	const hostileNpcs = systems.createEretzHostilePopulation(runtime);
	await reveal(environment, boot, 'Distant challenges entered the world.', 0.4);
	const doors = systems.createEretzDoors(runtime, runtime.state);
	await reveal(environment, boot, 'Doors and interiors became interactive.', 0.55);
	const horses = systems.createEretzHorseHerd(runtime);
	await reveal(environment, boot, 'The horse herd entered the valley.', 0.7);
	const targetCoordinator = systems.createEretzTargetCoordinator(runtime, friendlyNpcs, hostileNpcs);
	const lava = new systems.LavaLevel(runtime.scene, runtime.assets);
	const shadows = new systems.SunShadowProjector(runtime.scene);
	const worldMode = createWorldMode(runtime, systems, {
		doors,
		friendlyNpcs,
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
		friendlyNpcs,
		horses,
		hostileNpcs,
		houseVisibility,
		lava,
		npc: friendlyNpcs.primary,
		shadows,
		targetCoordinator,
		worldMode
	});
	await reveal(environment, boot, 'World actors are streaming normally.', 1);
	return Object.freeze({
		doors: doors.length,
		friendly: friendlyNpcs.actors.length,
		horses: horses.horses?.length || 0,
		hostile: hostileNpcs.actors.length,
		status: 'ready'
	});
}

async function loadSystems() {
	const [factories, lava, shadows, mode, visibility] = await Promise.all([
		import('./EretzActorFactories.js?v=20260722-world-stream-01'),
		import('../world/LavaLevel.js?v=20260722-world-stream-01'),
		import('../world/SunShadowProjector.js?v=20260722-world-stream-01'),
		import('../world/WorldModeManager.js?v=20260722-world-stream-01'),
		import('../world/visibility/HouseVisibilitySystem.js?v=20260722-world-stream-01')
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
			actors.friendlyNpcs.group,
			actors.hostileNpcs.group,
			actors.horses.group,
			...actors.doors.map(door => door.mesh)
		],
		mover: runtime.mover,
		state: runtime.state
	}).rememberMainHeight(runtime.terrain.heightAt);
}

async function reveal(environment, boot, detail, progress) {
	boot?.progress?.('world-actor-stream', progress, 1, detail);
	await afterVisibleFrames(1, environment);
}

function delayedStart(milliseconds, environment) {
	return new Promise(resolve => {
		if (typeof environment.setTimeout === 'function') {
			environment.setTimeout(resolve, milliseconds);
			return;
		}
		resolve();
	});
}
