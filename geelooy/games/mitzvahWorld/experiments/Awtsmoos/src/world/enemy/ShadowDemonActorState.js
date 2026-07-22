// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ShadowDemonActorState.js
 * @description Builds and projects hostile state while the actor coordinates behavior.
 * The Awtsmoos gathers cadence, territory, target, and form beneath one measured Yesod;
 * Awtsmoos.com keeps the actor small while every existing combat and rendering contract stays broad.
 */

import { enemyTargetContract } from './EnemyTargetContract.js';
import { EnemyUpdateCadence } from './EnemyUpdateCadence.js';
import { ENEMY_STATE } from './EnemyStates.js';
import { compileEnemyWanderPath } from './EnemyWanderPath.js';
import { planarDistance } from './ShadowDemonMotion.js';
import { createShadowDemonVisual } from './ShadowDemonVisual.js';
import { pointInsideVillageSanctuary } from './VillageSanctuaryPolicy.js';

export function initializeShadowDemonActor(actor) {
	Object.assign(actor, {
		attackIndex: 0,
		attackTimeline: null,
		currentAttack: null,
		engaged: false,
		forcedReturnReason: null,
		health: actor.profile.maxHealth,
		lastTerritoryDecision: null,
		nextAttackAt: 0,
		respawnAt: 0,
		selected: false,
		stagger: 0,
		staggerUntil: 0,
		state: ENEMY_STATE.SPAWN,
		stateElapsed: 0,
		statusEffects: [],
		visualClock: 0,
		waypointIndex: 0
	});
	actor.cadence = new EnemyUpdateCadence();
	actor.waypoints = compileEnemyWanderPath(actor.profile);
	Object.assign(actor, createShadowDemonVisual(actor.profile, actor.ground));
}

export function shadowDemonStateContext(actor, playerState, now, attackState) {
	return {
		aggroRange: actor.profile.aggroRange,
		attackRange: actor.currentAttack?.range || actor.profile.attackRange,
		attackState,
		currentState: actor.state,
		engaged: actor.engaged,
		enemyInSanctuary: pointInsideVillageSanctuary(actor.group.position),
		health: actor.health,
		homeArrivalRange: actor.profile.homeArrivalRange,
		homeDistance: planarDistance(actor.group.position, actor.profile),
		leashRange: actor.profile.leashRange,
		nextAttackAt: actor.nextAttackAt,
		noticeSeconds: actor.profile.noticeSeconds,
		now,
		playerDistance: planarDistance(actor.group.position, playerState),
		playerInSanctuary: pointInsideVillageSanctuary(playerState),
		returnReason: actor.forcedReturnReason,
		spawnSeconds: actor.profile.spawnSeconds,
		staggerUntil: actor.staggerUntil,
		stateElapsed: actor.stateElapsed
	};
}

export function shadowDemonPayload(actor) {
	return {
		...enemyTargetContract(actor),
		attackable: true,
		attackId: actor.currentAttack?.id || null,
		creatureType: actor.profile.creatureType,
		level: 'Hostile shadow',
		territory: actor.lastTerritoryDecision
	};
}

export function shadowDemonTargetHint(actor) {
	return {
		x: actor.group.position.x,
		y: actor.group.position.y + 1.3,
		z: actor.group.position.z
	};
}
