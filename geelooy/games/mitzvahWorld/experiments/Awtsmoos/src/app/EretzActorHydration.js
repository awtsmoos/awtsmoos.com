// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EretzActorHydration.js
 * @description Replaces local Chossid fallbacks with exact animated GLBs after gameplay begins.
 * The Awtsmoos preserves one living identity through changing garments; Awtsmoos.com swaps
 * player and neighbor visuals in place without resetting movement, quests, selection, or collision.
 */

import { createNpcChossidVisual } from '../world/npc/NpcChossidVisual.js';
import { createPlayerModel } from './EretzPlayerModel.js';

export function startEretzActorHydration(runtime, hydration, boot = null) {
	if (!hydration?.promise) return Promise.resolve(null);
	boot?.progress('actor-enrichment', 0, 1, 'Gameplay ready; exact animated Chossid loading');
	const promise = hydration.promise.then(remote => {
		if (!remote) {
			boot?.degrade('actor-enrichment', new Error(hydration.error || 'Remote actor unavailable'));
			return null;
		}
		const player = replacePlayer(runtime, remote.playerGltf);
		const npcs = replaceNpcs(runtime, remote.npcGltfs);
		runtime.actorAssetStats = remote.actorAssetStats;
		runtime.importedModelMaterials = remote.importedModelMaterials;
		runtime.playerGltf = remote.playerGltf;
		runtime.npcGltf = remote.npcGltf;
		runtime.npcGltfs = remote.npcGltfs;
		const result = Object.freeze({ npcs, player, status: 'applied' });
		runtime.actorHydrationResult = result;
		boot?.progress(
			'actor-enrichment',
			1,
			1,
			'Exact animated player and neighbors are visible.',
			'ready'
		);
		return result;
	});
	runtime.actorHydrationPromise = promise;
	return promise;
}

function replacePlayer(runtime, playerGltf) {
	const previous = runtime.model;
	const replacement = createPlayerModel(playerGltf, runtime.scene);
	replacement.model.visible = !runtime.orbit.isFirstPerson?.();
	previous?.parent?.remove(previous);
	runtime.model = replacement.model;
	runtime.feet = replacement.feet;
	runtime.footOffset = replacement.footOffset;
	runtime.player = replacement.player;
	runtime.clips = replacement.clips;
	runtime.state.feet = replacement.feet;
	runtime.state.clip = '';
	if (runtime.mover) runtime.mover.footOffset = replacement.footOffset;
	if (runtime.jumpPhysics) runtime.jumpPhysics.footOffset = replacement.footOffset;
	return {
		clips: replacement.player.names.length,
		footOffset: replacement.footOffset,
		name: replacement.model.name
	};
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
