// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowEnemyActionFlow.js
 * @description Owns wind-up, singular impact or launch, recovery, and animation progress.
 * The Awtsmoos separates desire from deed; Awtsmoos.com lets finite timing reach one
 * truthful consequence before cooldown returns the enemy to continued pressure.
 */

import {
	beginEnemyMeleeStrike,
	executeEnemyMeleeImpact,
	finishEnemyAttack,
	launchEnemyRangedAttack
} from './MinimalMeadowEnemyAttackExecution.js';
import { minimalEnemyActionDuration } from './MinimalMeadowEnemyCombatDecision.js';

export function advanceMinimalEnemyAction(combat) {
	const state = combat.session.state;
	combat.actor.actionProgress = actionProgress(combat);
	combat.actor.action = combat.action;
	combat.actor.moving = false;
	if (state === 'melee-windup') return advanceMeleeWindup(combat);
	if (state === 'melee-impact') return advanceMeleeImpact(combat);
	if (state === 'cast-windup') return advanceCastWindup(combat);
	return true;
}

export function advanceMinimalEnemyRecovery(combat) {
	combat.actor.action = 'idle';
	combat.actor.moving = false;
	if (combat.session.stateTime >= minimalEnemyActionDuration('recovery')) {
		const next = combat.session.role === 'caster' ? 'reposition' : 'approach';
		combat.session.transition(next, 'recovery-complete');
	}
	return true;
}

export function beginMinimalEnemyAction(combat, state) {
	combat.session.transition(state, 'attack-ready');
	combat.action = state === 'cast-windup' ? 'ranged-cast' : 'melee-windup';
	combat.actionTime = 0;
	combat.struck = false;
	combat.launched = false;
	combat.actor.action = combat.action;
	combat.actor.actionProgress = 0;
	combat.runtime.bus.emit('enemy:cast', {
		action: combat.action,
		duration: minimalEnemyActionDuration(state),
		enemyId: combat.actor.profile.id,
		letters: state === 'cast-windup' ? 'דין' : 'מכה',
		role: combat.session.role
	});
	return true;
}

function advanceMeleeWindup(combat) {
	if (combat.session.stateTime < minimalEnemyActionDuration('melee-windup')) return true;
	return beginEnemyMeleeStrike(combat);
}

function advanceMeleeImpact(combat) {
	if (combat.session.stateTime >= 0.16) executeEnemyMeleeImpact(combat);
	if (combat.session.stateTime >= minimalEnemyActionDuration('melee-impact')) {
		finishEnemyAttack(combat, 1.08);
	}
	return true;
}

function advanceCastWindup(combat) {
	if (!combat.lineOfSight) {
		combat.action = null;
		combat.session.transition('pursue', 'cast-line-of-sight-lost');
		return true;
	}
	if (combat.session.stateTime >= minimalEnemyActionDuration('cast-windup')) {
		launchEnemyRangedAttack(combat);
	}
	return true;
}

function actionProgress(combat) {
	const duration = Math.max(0.001, minimalEnemyActionDuration(combat.session.state));
	return Math.min(1, combat.session.stateTime / duration);
}
