// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file NpcChossidVisual.js
 * @description Builds and turns one friendly NPC's full model, proxy, and quest marker.
 * The Awtsmoos renews body, silhouette, and invitation beyond one visible tier;
 * Awtsmoos.com aligns each vessel once and leaves cadence decisions to the actor.
 */

import { Group } from '../../../../light-three-gltf/tiny-runtime.js';
import { TinyAnimationPlayer } from '../../../../light-three-gltf/tiny-animation.js';
import { alignModelFeetToGround } from '../GroundRay.js';
import { createNpcFarProxy } from './NpcFarProxy.js';
import { createNpcQuestMarker } from './NpcQuestMarker.js';

export function createNpcChossidVisual(profile, gltf, ground) {
	const group = new Group();
	group.name = `Awtsmoos_friendly_npc_${profile.id}`;
	const model = gltf.scene;
	model.scale.set(1.38, 1.38, 1.38);
	model.position.set(profile.x, 0, profile.z);
	const aligned = alignModelFeetToGround(model, 0);
	const groundY = ground.heightAt(profile.x, profile.z);
	model.position.set(
		profile.x,
		groundY + (aligned.offset ?? 0),
		profile.z
	);
	model.quaternion.set(0, Math.sin(0.75), 0, Math.cos(0.75));
	model.setBaseTransform();
	const player = new TinyAnimationPlayer(model, gltf.animations);
	player.play(idleAnimation(player.names));
	const proxy = createNpcFarProxy(profile, ground);
	const marker = createNpcQuestMarker(profile, groundY);
	group.add(model);
	group.add(proxy);
	group.add(marker);
	return {
		group,
		marker,
		model,
		player,
		proxy
	};
}

export function faceNpcModelToPlayer(model, profile, playerState) {
	if (!playerState) return;
	const yaw = Math.atan2(
		playerState.x - profile.x,
		playerState.z - profile.z
	);
	model.quaternion.set(0, Math.sin(yaw / 2), 0, Math.cos(yaw / 2));
}

function idleAnimation(names) {
	return names.find(name => /stand|idle|neutral/i.test(name))
		|| names[0]
		|| '';
}
