// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EnemyStatePolicy.js
 * @description Resolves one canonical hostile state from health, clocks, range, and sanctuary.
 * The Awtsmoos gives every apparent transition a finite vessel; Awtsmoos.com makes peace,
 * warning, impact, recovery, return, and defeat speak one shared language throughout the game.
 */

import { ENEMY_STATE, enemyStateIsUrgent as canonicalUrgency } from './EnemyStates.js';

/** Returns the next hostile state without mutating the actor or player. */
export function resolveEnemyState(context = {}) {
	if (Number(context.health) <= 0) return ENEMY_STATE.DEFEATED;
	if (mustReturnHome(context)) return ENEMY_STATE.RETURN_HOME;
	if (continuingReturn(context)) return ENEMY_STATE.RETURN_HOME;
	if (Number(context.now) < Number(context.staggerUntil || 0)) return ENEMY_STATE.STAGGER;
	if (continuingSpawn(context)) return ENEMY_STATE.SPAWN;
	if (context.attackState) return context.attackState;
	if (continuingAlert(context)) return ENEMY_STATE.ALERT;
	const aware = Boolean(context.engaged)
		|| Number(context.playerDistance) <= Number(context.aggroRange);
	if (!aware) return ENEMY_STATE.WANDER;
	if (!context.engaged) return ENEMY_STATE.ALERT;
	if (canBeginAttack(context)) return ENEMY_STATE.ATTACK_ANTICIPATION;
	return ENEMY_STATE.CHASE;
}

/** Preserves the historical import while delegating to the canonical state catalog. */
export function enemyStateIsUrgent(state) {
	return canonicalUrgency(state);
}

function mustReturnHome(context) {
	return Boolean(context.returnReason)
		|| Boolean(context.enemyInSanctuary)
		|| Boolean(context.playerInSanctuary)
		|| Number(context.homeDistance) > Number(context.leashRange);
}

function continuingReturn(context) {
	return context.currentState === ENEMY_STATE.RETURN_HOME
		&& Number(context.homeDistance) > Number(context.homeArrivalRange);
}

function continuingSpawn(context) {
	return context.currentState === ENEMY_STATE.SPAWN
		&& Number(context.stateElapsed) < Number(context.spawnSeconds || 0);
}

function continuingAlert(context) {
	return context.currentState === ENEMY_STATE.ALERT
		&& Number(context.stateElapsed) < Number(context.noticeSeconds || 0);
}

function canBeginAttack(context) {
	return Number(context.playerDistance) <= Number(context.attackRange)
		&& Number(context.now) >= Number(context.nextAttackAt || 0);
}
