// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowEnemyCombatDecision.js
 * @description Owns profile-aware distance, facing, pack steering, and action-duration policy.
 * The Awtsmoos distinguishes approach from impact; Awtsmoos.com gives six temperaments shared
 * geometry but different pursuit, spacing, assist, melee, ranged, and recovery decisions.
 */

import {
	minimalEnemyChaseVector,
	minimalEnemyPackAlerted
} from './MinimalMeadowEnemySteering.js?v=20260724-meadow-17';

export function enemyDistanceToPlayer(combat) {
	return Math.hypot(
		combat.runtime.state.x - combat.actor.group.position.x,
		combat.runtime.state.z - combat.actor.group.position.z
	);
}

export function enemyAggroRange(combat) {
	return minimalEnemyPackAlerted(combat.actor) ? 28 : 20;
}

export function enemyPrefersRanged(combat, distance) {
	const temperament = combat.actor.profile.temperament;
	if (temperament === 'ranged') return distance >= 4.4;
	if (temperament === 'melee') return distance >= 8.5;
	return distance >= 5.5;
}

export function faceEnemyTowardPlayer(combat) {
	const dx = combat.runtime.state.x - combat.actor.group.position.x;
	const dz = combat.runtime.state.z - combat.actor.group.position.z;
	const yaw = Math.atan2(dx, dz);
	combat.actor.group.quaternion.set(0, Math.sin(yaw / 2), 0, Math.cos(yaw / 2));
}

export function chaseEnemyTowardPlayer(combat, deltaSeconds) {
	const vector = minimalEnemyChaseVector(combat.actor, combat.runtime);
	combat.actor.action = 'chase';
	combat.actor.actionProgress = 0;
	combat.actor.moving = true;
	combat.actor.move(vector.x, vector.z, vector.distance, deltaSeconds * 1.22);
}

export function enemyActionDuration(action) {
	if (action === 'ranged-cast') return 1.05;
	if (action === 'melee-windup') return 0.48;
	return 0.55;
}
