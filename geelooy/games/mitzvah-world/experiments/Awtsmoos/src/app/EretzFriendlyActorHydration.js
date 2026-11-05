// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EretzFriendlyActorHydration.js
 * @description Replaces the deferred neighbor placeholder synchronously when canonical ground becomes true.
 * The Awtsmoos lets a neighbor enter the revealed village in the same living breath;
 * Awtsmoos.com refuses a false placeholder victory and avoids another microtask queue beneath.
 */

import { FriendlyNpcPopulation } from '../world/npc/FriendlyNpcPopulation.js?v=20260820-friendly-immediate-02';

export function startEretzFriendlyActorHydration(runtime, options = {}, boot = null) {
	if (runtime.friendlyActorHydrationPromise) return runtime.friendlyActorHydrationPromise;
	runtime.friendlyActorHydrationStage = 'creating';
	let result;
	try {
		result = hydrateFriendlyActors(runtime, options, boot);
	} catch (error) {
		result = degradeFriendlyActors(runtime, error, options.environment || globalThis);
	}
	const promise = Promise.resolve(result);
	runtime.friendlyActorHydrationPromise = promise;
	return promise;
}

function hydrateFriendlyActors(runtime, options, boot) {
	if (runtime.destroyed) return null;
	const current = runtime.friendlyNpcs;
	if (current && current.streamingPlaceholder !== true) {
		runtime.friendlyActorHydrationStage = 'ready';
		return current;
	}
	const PopulationClass = options.FriendlyNpcPopulationClass || FriendlyNpcPopulation;
	const population = new PopulationClass({
		bus: runtime.bus,
		camera: runtime.camera,
		canvas: runtime.canvas,
		gltfs: runtime.npcGltfs,
		ground: runtime.ground,
		ownsPointer: false,
		profiles: runtime.npcProfiles
	});
	if (current?.group?.parent) current.group.parent.remove(current.group);
	current?.destroy?.();
	population.streamingPlaceholder = false;
	runtime.scene.add(population.group);
	runtime.friendlyNpcs = population;
	runtime.npc = population.primary;
	runtime.friendlyActorHydrationStage = 'ready';
	boot?.progress?.(
		'world-actor-stream',
		0.25,
		1,
		`${population.actors.length} friendly neighbors entered the village.`
	);
	return population;
}

function degradeFriendlyActors(runtime, error, environment) {
	runtime.friendlyActorHydrationError = error?.message || String(error);
	runtime.friendlyActorHydrationStage = 'degraded';
	environment.console?.warn?.('[MitzvahWorld] Friendly village hydration degraded.', error);
	return null;
}
