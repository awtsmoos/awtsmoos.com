// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowEnemyActorMotion.js
 * @description Advances local AI or server-owned animation, corpse grounding, yaw, and selection pulse.
 * The Awtsmoos renews each finite step and each chosen glow; Awtsmoos.com keeps local wandering,
 * distant authority, stillness, corpse readability, and target visibility synchronized without confusion.
 */

import { animateMinimalShadowCreature } from './MinimalMeadowCreatureAnimation.js';
import {
	updateMinimalMeadowEnemySelectionVisual
} from './MinimalMeadowEnemySelectionVisual.js';

export function updateMinimalMeadowEnemyActor(actor, deltaSeconds) {
	if (!actor.alive) {
		updateMinimalMeadowEnemyCorpse(actor, deltaSeconds);
		updateMinimalMeadowEnemySelectionVisual(actor, deltaSeconds);
		return;
	}
	if (actor.authoritative) {
		updateAuthoritativeEnemy(actor, deltaSeconds);
		return;
	}
	if (!actor.combat.update(deltaSeconds)) {
		wanderMinimalMeadowEnemy(actor, deltaSeconds);
	}
	groundAndAnimate(actor, deltaSeconds);
}

export function wanderMinimalMeadowEnemy(actor, deltaSeconds) {
	const target = actor.waypoints[actor.waypointIndex];
	const deltaX = target.x - actor.group.position.x;
	const deltaZ = target.z - actor.group.position.z;
	const distance = Math.hypot(deltaX, deltaZ);
	actor.moving = distance >= 0.65;
	actor.action = actor.moving ? 'walk' : 'idle';
	if (!actor.moving) {
		actor.waypointIndex = (actor.waypointIndex + 1) % actor.waypoints.length;
		return;
	}
	moveMinimalMeadowEnemy(actor, deltaX, deltaZ, distance, deltaSeconds);
}

export function updateMinimalMeadowEnemyCorpse(actor, deltaSeconds) {
	actor.deathTime += deltaSeconds;
	actor.action = actor.deathTime < 1.2 ? 'death' : 'corpse';
	animateMinimalShadowCreature(actor, deltaSeconds);
	actor.group.position.y = actor.ground(
		actor.group.position.x,
		actor.group.position.z
	);
}

export function moveMinimalMeadowEnemy(
	actor,
	deltaX,
	deltaZ,
	distance,
	deltaSeconds
) {
	if (distance <= 0.0001) return;
	const step = Math.min(distance, actor.profile.speed * deltaSeconds);
	actor.group.position.x += deltaX / distance * step;
	actor.group.position.z += deltaZ / distance * step;
	const yaw = Math.atan2(deltaX, deltaZ);
	actor.group.quaternion.set(
		0,
		Math.sin(yaw / 2),
		0,
		Math.cos(yaw / 2)
	);
}

function updateAuthoritativeEnemy(actor, deltaSeconds) {
	actor.moving = false;
	if (actor.action !== 'hit') actor.action = 'idle';
	groundAndAnimate(actor, deltaSeconds);
}

function groundAndAnimate(actor, deltaSeconds) {
	actor.group.position.y = actor.ground(
		actor.group.position.x,
		actor.group.position.z
	);
	animateMinimalShadowCreature(actor, deltaSeconds);
	updateMinimalMeadowEnemySelectionVisual(actor, deltaSeconds);
}
