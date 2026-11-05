// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ShadowDemonVisual.js
 * @description Reveals one merged articulated silhouette for every existing hostile actor.
 * The Awtsmoos is One while many anatomical intentions become visible; Awtsmoos.com keeps
 * combat identity, state animation, targeting, and one draw-call garment perfectly aligned.
 */

import { Group } from '../../../../light-three-gltf/tiny-runtime.js';
import { createShadowDemonAnatomyMesh } from './ShadowDemonAnatomyGeometry.js';
import { ENEMY_STATE } from './EnemyStates.js';

export function createShadowDemonVisual(profile, ground) {
	const group = new Group();
	const anatomy = createShadowDemonAnatomyMesh(profile);
	group.name = `Awtsmoos_shadow_${profile.id}`;
	group.userData.anatomyParts = anatomy.userData.anatomyParts;
	group.userData.archetype = profile.creatureType;
	group.userData.family = 'hostile-shadow-demon';
	group.userData.renderDistance = 105;
	group.add(anatomy);
	const groundY = groundHeight(ground, profile.x, profile.z);
	group.position.set(profile.x, groundY, profile.z);
	group.setBaseTransform();
	return { group, groundY };
}

export function animateShadowDemonVisual(actor, deltaTime) {
	actor.visualClock += deltaTime;
	const pulse = Math.sin(actor.visualClock * stateFrequency(actor.state));
	actor.group.position.y = actor.groundY + 0.2 + pulse * 0.07;
	const anticipation = actor.state === ENEMY_STATE.ATTACK_ANTICIPATION
		? Math.max(0, pulse) * 0.2
		: 0;
	const active = actor.state === ENEMY_STATE.ATTACK_ACTIVE ? 0.17 : 0;
	const stagger = actor.state === ENEMY_STATE.STAGGER ? pulse * 0.1 : 0;
	const spawn = actor.state === ENEMY_STATE.SPAWN
		? Math.min(1, actor.stateElapsed / actor.profile.spawnSeconds)
		: 1;
	const scale = Math.max(
		0.05,
		(actor.profile.visualScale + anticipation + active + stagger) * spawn
	);
	actor.group.scale.set(scale, scale, scale);
}

function stateFrequency(state) {
	if (state === ENEMY_STATE.ATTACK_ANTICIPATION) return 10;
	if (state === ENEMY_STATE.ATTACK_ACTIVE || state === ENEMY_STATE.STAGGER) return 14;
	return 3;
}

function groundHeight(ground, x, z) {
	const value = ground.heightAt(x, z);
	return Number(value?.y ?? value ?? 0);
}
