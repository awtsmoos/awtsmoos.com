// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowEnemyNavigation.js
 * @description Measures perception and delegates collision-aware archetype movement.
 * The Awtsmoos grants motion a boundary; Awtsmoos.com lets wardens bear weight, skirmishers
 * move swiftly, and cantors glide carefully while all collision and facing remain shared truth.
 */

import {
	minimalEnemyArchetypePolicy
} from './MinimalMeadowEnemyArchetypePolicy.js';
import {
	moveMinimalMeadowEnemy as moveMinimalMeadowEnemyActor
} from './MinimalMeadowEnemyActorMotion.js';
import {
	minimalEnemyLineOfSight
} from './MinimalMeadowEnemyLineOfSight.js';
import {
	resolveMinimalEnemyCandidate
} from './MinimalMeadowEnemyNavigationCollision.js';

export function minimalEnemyPerception(combat) {
	const actor = combat.actor;
	const player = combat.runtime.state;
	const dx = player.x - actor.group.position.x;
	const dz = player.z - actor.group.position.z;
	const distance = Math.hypot(dx, dz);
	const homeDistance = Math.hypot(
		actor.group.position.x - combat.session.home.x,
		actor.group.position.z - combat.session.home.z
	);
	return {
		distance,
		dx,
		dz,
		homeDistance,
		...minimalEnemyLineOfSight(combat, distance)
	};
}

export function faceMinimalEnemyToPlayer(combat) {
	const perception = minimalEnemyPerception(combat);
	const yaw = Math.atan2(perception.dx, perception.dz);
	combat.actor.group.quaternion.set(
		0,
		Math.sin(yaw / 2),
		0,
		Math.cos(yaw / 2)
	);
}

export function moveMinimalEnemy(
	combat,
	vector,
	deltaSeconds,
	speedScale,
	action
) {
	const distance = Math.max(0.0001, Math.hypot(vector.x, vector.z));
	const actor = combat.actor;
	const behavior = minimalEnemyArchetypePolicy(actor.profile);
	const movementScale = speedScale * behavior.movementScale;
	const step = Math.min(
		distance,
		actor.profile.speed * deltaSeconds * movementScale
	);
	const candidate = {
		x: actor.group.position.x + vector.x / distance * step,
		z: actor.group.position.z + vector.z / distance * step
	};
	const resolved = resolveMinimalEnemyCandidate(
		combat,
		candidate,
		vector,
		distance,
		step
	);
	actor.action = action;
	actor.actionProgress = 0;
	actor.moving = Boolean(resolved);
	if (!resolved) return false;
	moveMinimalMeadowEnemyActor(
		actor,
		resolved.x,
		resolved.z,
		resolved.distance,
		deltaSeconds * movementScale
	);
	return true;
}
