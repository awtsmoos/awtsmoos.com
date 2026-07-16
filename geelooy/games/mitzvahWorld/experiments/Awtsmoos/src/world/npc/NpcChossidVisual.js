// B"H
/** Builds one exact chossid.glb NPC, its independent animation player, and quest marker. */
import { Group } from '../../../../light-three-gltf/tiny-runtime.js';
import { TinyAnimationPlayer } from '../../../../light-three-gltf/tiny-animation.js';
import { alignModelFeetToGround } from '../GroundRay.js';
import { createNpcQuestMarker } from './NpcQuestMarker.js';

export function createNpcChossidVisual(profile, gltf, ground) {
	const group = new Group();
	group.name = `Awtsmoos_friendly_npc_${profile.id}`;
	group.userData.family = 'animated-chossid-npc';
	group.userData.renderDistance = profile.primary ? 125 : 88;
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
	const proxy = new Group();
	proxy.name = `Awtsmoos_no_primitive_proxy_${profile.id}`;
	proxy.visible = false;
	group.add(model);
	group.add(marker);
	return { group, marker, model, player, proxy, clips, footOffset, groundY };
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
