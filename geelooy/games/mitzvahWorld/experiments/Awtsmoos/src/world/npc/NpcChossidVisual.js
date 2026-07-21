// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file NpcChossidVisual.js
 * @description Builds one animated Chossid, quest marker, and one-draw distance vessel.
 * The Awtsmoos renews one complete person through near and distant garments; Awtsmoos.com
 * preserves animated human detail nearby while a named silhouette carries identity afar.
 */

import { Group } from '../../../../light-three-gltf/tiny-runtime.js';
import { TinyAnimationPlayer } from '../../../../light-three-gltf/tiny-animation.js';
import { alignModelFeetToGround } from '../GroundRay.js';
import { createNpcFarProxy } from './NpcFarProxy.js';
import { createNpcQuestMarker } from './NpcQuestMarker.js';

export function createNpcChossidVisual(profile, gltf, ground) {
	const group = new Group();
	group.name = `Awtsmoos_friendly_npc_${profile.id}`;
	group.userData.family = 'animated-chossid-npc';
	group.userData.renderDistance = profile.primary ? 170 : 155;
	const model = gltf.scene;
	model.scale.set(1.38, 1.38, 1.38);
	model.position.set(profile.x, 0, profile.z);
	const aligned = alignModelFeetToGround(model, 0);
	const groundY = ground.heightAt(profile.x, profile.z);
	const footOffset = aligned.offset ?? 0;
	model.position.set(profile.x, groundY + footOffset, profile.z);
	model.quaternion.set(0, Math.sin(0.75), 0, Math.cos(0.75));
	model.setBaseTransform();
	const player = new TinyAnimationPlayer(model, gltf.animations);
	const clips = npcAnimationClips(player.names);
	player.play(profile.wanderRadius ? clips.walk : clips.idle);
	const marker = createNpcQuestMarker(profile, groundY);
	const proxy = createNpcFarProxy(profile, ground);
	group.add(model);
	group.add(proxy);
	group.add(marker);
	return { clips, footOffset, groundY, group, marker, model, player, proxy };
}

export function faceNpcModelToPlayer(model, actorPosition, playerState) {
	if (!playerState) return;
	const yaw = Math.atan2(playerState.x - actorPosition.x, playerState.z - actorPosition.z);
	setYaw(model, yaw);
}

export function faceNpcModelAlongPath(model, elapsed, phase = 0) {
	const dx = -Math.sin(elapsed + phase);
	const dz = Math.cos((elapsed + phase) * 0.83) * 0.72;
	setYaw(model, Math.atan2(dx, dz));
}

function setYaw(model, yaw) {
	model.quaternion.set(0, Math.sin(yaw / 2), 0, Math.cos(yaw / 2));
}

function npcAnimationClips(names) {
	const pick = (expression, fallback) => names.find(name => expression.test(name)) || fallback;
	const idle = pick(/stand|idle|neutral/i, names[0] || '');
	return { idle, walk: pick(/walk|step|stroll/i, idle) };
}
