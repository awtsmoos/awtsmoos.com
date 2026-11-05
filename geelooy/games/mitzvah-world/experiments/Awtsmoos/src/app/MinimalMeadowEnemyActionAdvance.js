// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowEnemyActionAdvance.js
 * @description Advances melee and cast phases through one singular consequence and recovery boundary.
 * The Awtsmoos separates warning, impact, and return; Awtsmoos.com keeps line of sight,
 * projectile launch, strike singularity, completion receipts, cooldown, and progress exact.
 */

import {
	finishEnemyCast,
	impactEnemyMelee,
	launchEnemyCast
} from './MinimalMeadowEnemyAttackExecution.js';
import {
	minimalEnemyActionReceipt
} from './MinimalMeadowEnemyActionReceipt.js';
import {
	minimalEnemyActionDuration
} from './MinimalMeadowEnemyCombatDecision.js';

export function advanceMinimalEnemySelectedAction(combat) {
	const state = combat.session.state;
	const duration = actionDuration(combat, state);
	combat.actor.actionProgress = Math.min(
		1,
		combat.session.stateTime / Math.max(0.001, duration)
	);
	combat.actor.action = state;
	combat.actor.moving = false;
	if (state === 'melee-windup') return advanceMeleeWindup(combat, duration);
	if (state === 'melee-impact') return advanceMeleeImpact(combat, duration);
	if (state === 'cast-windup') return advanceCastWindup(combat, duration);
	return true;
}

export function completeMinimalEnemyRecovery(combat) {
	combat.actor.action = 'recovery';
	combat.actor.moving = false;
	if (combat.session.stateTime < actionDuration(combat, 'recovery')) return true;
	const next = combat.session.role === 'caster' ? 'reposition' : 'approach';
	combat.currentAction = null;
	combat.action = null;
	combat.actor.actionProgress = 0;
	combat.session.transition(next, 'recovery-complete');
	return true;
}

function advanceMeleeWindup(combat, duration) {
	if (combat.session.stateTime < duration) return true;
	combat.session.transition('melee-impact', 'windup-complete');
	combat.actor.action = 'melee-impact';
	return true;
}

function advanceMeleeImpact(combat, duration) {
	if (combat.session.stateTime >= Math.min(0.16, duration * 0.45)) {
		impactEnemyMelee(combat);
	}
	if (combat.session.stateTime >= duration) finishEnemyAction(combat);
	return true;
}

function advanceCastWindup(combat, duration) {
	if (!combat.lineOfSight) return false;
	if (combat.session.stateTime >= duration * 0.82) launchEnemyCast(combat);
	if (combat.session.stateTime >= duration) {
		finishEnemyCast(combat);
		finishEnemyAction(combat);
	}
	return true;
}

function finishEnemyAction(combat) {
	combat.runtime.bus.emit(
		'enemy:action-complete',
		minimalEnemyActionReceipt(combat)
	);
	combat.cooldown = 0.7 + combat.actor.profile.level * 0.08;
	combat.session.transition('recovery', 'action-complete');
	combat.actor.action = 'recovery';
	combat.actor.actionProgress = 0;
}

function actionDuration(combat, state) {
	return minimalEnemyActionDuration(state)
		* Number(combat.currentAction?.durationMultiplier || 1);
}
