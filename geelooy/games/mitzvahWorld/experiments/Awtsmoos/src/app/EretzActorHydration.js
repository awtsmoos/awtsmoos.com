// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EretzActorHydration.js
 * @description Replaces fallback neighbors after the canonical animated player is already visible.
 * The Awtsmoos preserves one living identity while distant garments arrive; Awtsmoos.com leaves
 * the loaded player untouched and enriches NPC bodies without resetting movement or quests.
 */

import { createNpcChossidVisual } from '../world/npc/NpcChossidVisual.js';

export function startEretzActorHydration(runtime, hydration, boot = null) {
	if (!hydration?.promise) return Promise.resolve(null);
	boot?.progress('actor-enrichment', 0, 1, 'Canonical player ready; neighbors loading later');
	const promise = hydration.promise.then(remote => {
		if (!remote) {
			boot?.degrade('actor-enrichment', new Error(hydration.error || 'Remote NPC actors unavailable'));
			return null;
		}
		const npcs = replaceNpcs(runtime, remote.npcGltfs);
		runtime.actorAssetStats = remote.actorAssetStats;
		runtime.npcGltf = remote.npcGltf;
		runtime.npcGltfs = remote.npcGltfs;
		if (remote.importedModelMaterials?.npcs) {
			runtime.importedModelMaterials.npcs = remote.importedModelMaterials.npcs;
		}
		const result = Object.freeze({ npcs, player: 'already-canonical', status: 'applied' });
		runtime.actorHydrationResult = result;
		boot?.progress('actor-enrichment', 1, 1, 'Animated Chossid neighbors are visible.', 'ready');
		return result;
	});
	runtime.actorHydrationPromise = promise;
	return promise;
}

function replaceNpcs(runtime, gltfs = []) {
	const actors = runtime.friendlyNpcs?.actors || [];
	let replaced = 0;
	for (const [index, actor] of actors.entries()) {
		const gltf = gltfs[index];
		if (!gltf) continue;
		const visual = createNpcChossidVisual(actor.profile, gltf, actor.ground);
		actor.model?.parent?.remove(actor.model);
		actor.group.add(visual.model);
		actor.model = visual.model;
		actor.player = visual.player;
		actor.clips = visual.clips;
		actor.footOffset = visual.footOffset;
		actor.groundY = visual.groundY;
		actor.worldY = visual.groundY + visual.footOffset;
		replaced += 1;
	}
	return replaced;
}
