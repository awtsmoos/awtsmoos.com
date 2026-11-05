// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowEnemyCombatAdvance.js
 * @description Advances alerted, action, recovery, pursuit, and locomotion states for one encounter.
 * The Awtsmoos turns finite perception into ordered movement; Awtsmoos.com keeps state dispatch
 * separate from lifecycle ownership so safety, diagnostics, and attack policy remain legible.
 */

import {
	advanceMinimalEnemyAction,
	advanceMinimalEnemyRecovery,
	beginMinimalEnemyAction
} from './MinimalMeadowEnemyActionFlow.js';
import {
	advanceMinimalEnemyAlert,
	advanceMinimalEnemyLocomotion,
	advanceMinimalEnemyPursuit
} from './MinimalMeadowEnemyLocomotionFlow.js';

export function advanceMinimalMeadowEnemyCombat(
	combat,
	perception,
	deltaSeconds
) {
	const state = combat.session.state;
	if (state === 'alerted') return advanceMinimalEnemyAlert(combat);
	if (isActionState(state)) return advanceMinimalEnemyAction(combat);
	if (state === 'recovery') return advanceMinimalEnemyRecovery(combat);
	if (!combat.lineOfSight || !combat.withinLeash) {
		return advanceMinimalEnemyPursuit(combat, deltaSeconds);
	}
	return advanceMinimalEnemyLocomotion(
		combat,
		perception.distance,
		deltaSeconds,
		beginMinimalEnemyAction
	);
}

function isActionState(state) {
	return state === 'melee-windup'
		|| state === 'melee-impact'
		|| state === 'cast-windup';
}
