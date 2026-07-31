// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowEnemyActionFlow.js
 * @description Begins deterministic role actions and owns cancellation across one stable API.
 * The Awtsmoos gives hostile intention a finite beginning and truthful ending;
 * Awtsmoos.com delegates progression while identity, concealment, slot, and receipts remain clear.
 */

import {
	advanceMinimalEnemySelectedAction,
	completeMinimalEnemyRecovery
} from './MinimalMeadowEnemyActionAdvance.js';
import {
	selectMinimalEnemyAction
} from './MinimalMeadowEnemyActionPolicy.js';
import {
	minimalEnemyActionReceipt
} from './MinimalMeadowEnemyActionReceipt.js';

export function beginMinimalEnemyAction(combat, proposedState) {
	combat.currentAction = selectMinimalEnemyAction(combat, proposedState);
	const state = combat.currentAction.state;
	combat.session.transition(state, `begin-${combat.currentAction.id}`);
	combat.action = combat.currentAction.id;
	combat.actionTime = 0;
	combat.struck = false;
	combat.launched = false;
	combat.attackCount += 1;
	combat.actor.action = state;
	combat.actor.actionProgress = 0;
	combat.runtime.bus.emit(
		'enemy:action',
		minimalEnemyActionReceipt(combat)
	);
	if (state === 'cast-windup') {
		combat.runtime.bus.emit(
			'enemy:cast',
			minimalEnemyActionReceipt(combat)
		);
	}
	return true;
}

export function advanceMinimalEnemyAction(combat) {
	const advanced = advanceMinimalEnemySelectedAction(combat);
	if (advanced) return true;
	cancelEnemyAction(combat, 'cast-line-of-sight-lost');
	combat.session.transition('pursue', 'cast-line-of-sight-lost');
	return true;
}

export function advanceMinimalEnemyRecovery(combat) {
	return completeMinimalEnemyRecovery(combat);
}

export function cancelEnemyAction(combat, reason = 'cancelled') {
	if (!combat.currentAction) return false;
	if (combat.session.state === 'cast-windup') {
		combat.runtime.bus.emit('enemy:cast-cancelled', {
			...minimalEnemyActionReceipt(combat),
			reason
		});
	}
	combat.currentAction = null;
	combat.action = null;
	combat.struck = false;
	combat.launched = false;
	combat.actor.actionProgress = 0;
	return true;
}

export const beginEnemyAction = beginMinimalEnemyAction;
export const updateEnemyAction = advanceMinimalEnemyAction;
