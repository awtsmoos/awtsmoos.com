// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ShadowDemonMotion.js
 * @description Moves shadows through chase, circle, retreat, return, and wander policies.
 * The Awtsmoos joins journey and boundary in one renewed instant; Awtsmoos.com keeps
 * water, cliff, sanctuary, leash, and readable combat spacing stronger than pursuit.
 */

import { ENEMY_STATE } from './EnemyStates.js';
import { resolveEnemyGroundStep } from './EnemyTerrainPolicy.js';
import { evaluateEnemyMovement } from './EnemyTerritoryPolicy.js';

export function updateShadowDemonMotion(actor, deltaTime, playerState) {
	if (actor.state === ENEMY_STATE.CHASE || actor.state === ENEMY_STATE.APPROACH) {
		return pursuePlayer(actor, playerState, deltaTime);
	}
	if (actor.state === ENEMY_STATE.CIRCLE) {
		return circlePlayer(actor, playerState, deltaTime);
	}
	if (actor.state === ENEMY_STATE.RETURN_HOME || actor.state === ENEMY_STATE.RETREAT) {
		return returnShadowHome(actor, deltaTime);
	}
	if (actor.state === ENEMY_STATE.WANDER || actor.state === ENEMY_STATE.PATROL) {
		return wanderShadow(actor, deltaTime);
	}
	return true;
}

export function planarDistance(first, second) {
	return Math.hypot(first.x - second.x, first.z - second.z);
}

export function shadowGroundHeight(ground, x, z) {
	const value = ground.heightAt(x, z);
	return Number(value?.y ?? value ?? 0);
}

function pursuePlayer(actor, playerState, deltaTime) {
	const moved = moveShadowToward(
		actor,
		playerState,
		actor.profile.speed,
		deltaTime,
		'chase'
	);
	actor.forcedReturnReason = moved ? null : actor.lastTerritoryDecision?.reason;
	return moved;
}

function circlePlayer(actor, playerState, deltaTime) {
	const dx = playerState.x - actor.group.position.x;
	const dz = playerState.z - actor.group.position.z;
	const length = Math.max(0.001, Math.hypot(dx, dz));
	const direction = actor.attackIndex % 2 === 0 ? 1 : -1;
	const target = {
		x: actor.group.position.x - dz / length * direction * 2,
		z: actor.group.position.z + dx / length * direction * 2
	};
	return moveShadowToward(actor, target, actor.profile.speed * 0.72, deltaTime, 'circle');
}

function wanderShadow(actor, deltaTime) {
	const waypoint = actor.waypoints[actor.waypointIndex];
	if (planarDistance(actor.group.position, waypoint) < 0.8) {
		advanceWaypoint(actor);
		return true;
	}
	const moved = moveShadowToward(
		actor,
		waypoint,
		actor.profile.speed * 0.38,
		deltaTime,
		'wander'
	);
	if (!moved) advanceWaypoint(actor);
	return moved;
}

function returnShadowHome(actor, deltaTime) {
	if (planarDistance(actor.group.position, actor.profile) <= actor.profile.homeArrivalRange) {
		actor.engaged = false;
		actor.forcedReturnReason = null;
		return true;
	}
	return moveShadowToward(
		actor,
		actor.profile,
		actor.profile.speed * 1.2,
		deltaTime,
		'return'
	);
}

function moveShadowToward(actor, target, speed, deltaTime, purpose) {
	const from = actor.group.position;
	const dx = target.x - from.x;
	const dz = target.z - from.z;
	const length = Math.max(0.0001, Math.hypot(dx, dz));
	const step = Math.min(length, speed * deltaTime);
	const proposed = {
		x: from.x + dx / length * step,
		z: from.z + dz / length * step
	};
	const candidate = resolveEnemyGroundStep(actor.ground, from, proposed, actor.profile);
	const decision = evaluateEnemyMovement({ candidate, from, ground: actor.ground, profile: actor.profile, purpose });
	actor.lastTerritoryDecision = decision;
	if (!decision.allowed) return false;
	actor.group.position.x = candidate.x;
	actor.group.position.z = candidate.z;
	actor.groundY = shadowGroundHeight(actor.ground, candidate.x, candidate.z);
	const yaw = Math.atan2(dx, dz);
	actor.group.quaternion.set(0, Math.sin(yaw / 2), 0, Math.cos(yaw / 2));
	return true;
}

function advanceWaypoint(actor) {
	actor.waypointIndex = (actor.waypointIndex + 1) % actor.waypoints.length;
}
