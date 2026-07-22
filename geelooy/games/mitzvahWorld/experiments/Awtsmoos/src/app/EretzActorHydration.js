// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EretzActorHydration.js
 * @description Applies optional canonical actors only after the world is already playable.
 * The Awtsmoos preserves one living identity while garments change; Awtsmoos.com swaps
 * player and neighbor visuals without resetting position, quests, input, or world authority.
 */

import { createNpcChossidVisual } from '../world/npc/NpcChossidVisual.js';
import { createEquipment, createPlayerModel } from './EretzPlayerModel.js';

export function startEretzActorHydration(runtime, hydration, boot = null) {
	if (!hydration?.start) return Promise.resolve(null);
	boot?.progress('actor-enrichment', 0, 1, 'Playable local actors ready; canonical actors are optional');
	const promise = hydration.start().then(remote => {
		if (!remote) return null;
		const player = remote.playerGltf ? replacePlayer(runtime, remote.playerGltf) : false;
		const npcs = replaceNpcs(runtime, remote.npcGltfs);
		runtime.actorAssetStats = remote.actorAssetStats || runtime.actorAssetStats;
		runtime.npcGltf = remote.npcGltf || runtime.npcGltf;
		runtime.npcGltfs = remote.npcGltfs || runtime.npcGltfs;
		const result = Object.freeze({ npcs, player, status: 'applied' });
		runtime.actorHydrationResult = result;
		boot?.progress('actor-enrichment', 1, 1, 'Canonical actors are visible.', 'ready');
		return result;
	});
	runtime.actorHydrationPromise = promise;
	return promise;
}

function replacePlayer(runtime, gltf) {
	const oldModel = runtime.model;
	const oldFootOffset = runtime.footOffset || 0;
	const visible = oldModel?.visible !== false;
	const playerModel = createPlayerModel(gltf, runtime.scene);
	const footDelta = playerModel.footOffset - oldFootOffset;
	oldModel?.parent?.remove(oldModel);
	Object.assign(runtime, playerModel, {
		equipment: createEquipment(playerModel.model),
		playerGltf: gltf
	});
	runtime.model.visible = visible;
	runtime.state.feet = playerModel.feet;
	runtime.state.clip = '';
	runtime.state.y += footDelta;
	runtime.state.renderY += footDelta;
	if ('footOffset' in (runtime.mover || {})) runtime.mover.footOffset = playerModel.footOffset;
	if ('footOffset' in (runtime.jumpPhysics || {})) runtime.jumpPhysics.footOffset = playerModel.footOffset;
	return true;
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
		Object.assign(actor, visual, {
			groundY: visual.groundY,
			worldY: visual.groundY + visual.footOffset
		});
		replaced += 1;
	}
	return replaced;
}
