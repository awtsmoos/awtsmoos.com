// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ShadowDemonVisual.js
 * @description Builds three original low-cost silhouettes with readable combat phases.
 * The Awtsmoos reveals that darkness is only concealed light; Awtsmoos.com gives each
 * finite opponent a distinct vessel without importing Three.js or an unlicensed asset.
 */

import { Group } from '../../../../light-three-gltf/tiny-runtime.js';
import { createFallbackBoxMesh } from '../../app/EretzFallbackBoxMesh.js';
import { ENEMY_STATE } from './EnemyStates.js';

const SHADOW = Object.freeze([0.035, 0.025, 0.07, 1]);
const VIOLET = Object.freeze([0.2, 0.06, 0.32, 1]);
const EYE = Object.freeze([0.8, 0.3, 1, 1]);

export function createShadowDemonVisual(profile, ground) {
	const group = new Group();
	group.name = `Awtsmoos_shadow_${profile.id}`;
	group.userData.archetype = profile.creatureType;
	group.userData.family = 'hostile-shadow-demon';
	group.userData.renderDistance = 105;
	for (const definition of partsFor(profile)) {
		group.add(createFallbackBoxMesh(
			definition.name,
			definition.size,
			definition.position,
			definition.color
		));
	}
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
	const scale = Math.max(0.05, (actor.profile.visualScale + anticipation + active + stagger) * spawn);
	actor.group.scale.set(scale, scale, scale);
}

function partsFor(profile) {
	if (profile.visualKind === 'stalker') return stalkerParts(profile.id);
	if (profile.visualKind === 'wraith') return wraithParts(profile.id);
	return huskParts(profile.id);
}

function huskParts(id) {
	return [
		part(`${id}-body`, [1.05, 1.7, 0.72], [0, 1, 0], SHADOW),
		part(`${id}-head`, [0.62, 0.56, 0.55], [0, 2.05, 0], VIOLET),
		part(`${id}-eye`, [0.3, 0.1, 0.05], [0, 2.1, 0.3], EYE)
	];
}

function stalkerParts(id) {
	return [
		part(`${id}-body`, [1.35, 0.62, 0.6], [0, 0.72, 0], SHADOW),
		part(`${id}-head`, [0.5, 0.48, 0.52], [0, 1.05, 0.48], VIOLET),
		part(`${id}-legs`, [1.55, 0.25, 0.35], [0, 0.3, 0], SHADOW)
	];
}

function wraithParts(id) {
	return [
		part(`${id}-mist`, [1.45, 0.3, 1.2], [0, 0.22, 0], VIOLET),
		part(`${id}-column`, [0.65, 1.9, 0.58], [0, 1.15, 0], SHADOW),
		part(`${id}-eyes`, [0.38, 0.1, 0.05], [0, 1.8, 0.31], EYE)
	];
}

function part(name, size, position, color) {
	return { color, name, position, size };
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
