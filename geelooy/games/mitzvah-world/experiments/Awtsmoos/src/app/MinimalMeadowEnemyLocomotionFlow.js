// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowEnemyLocomotionFlow.js
 * @description Owns alert completion, pursuit, approach, caster retreat, and orbit pressure.
 * The Awtsmoos binds motion to purpose; Awtsmoos.com keeps finite enemies from mistaking
 * cooldown or a crossed aggro edge for permission to flee back into waypoint wandering.
 */

import {
	minimalEnemyCombatRanges,
	minimalEnemyLocomotionState
} from './MinimalMeadowEnemyCombatDecision.js';
import { moveMinimalEnemy } from './MinimalMeadowEnemyNavigation.js';
import {
	minimalEnemyApproachVector,
	minimalEnemyOrbitVector,
	minimalEnemyRetreatVector
} from './MinimalMeadowEnemySteering.js';

export function advanceMinimalEnemyAlert(combat) {
	combat.actor.action = 'idle';
	combat.actor.moving = false;
	if (combat.session.stateTime >= Math.max(0.24, combat.session.openingDelay)) {
		combat.session.transition('approach', 'alert-complete');
	}
	return true;
}

export function advanceMinimalEnemyPursuit(combat, deltaSeconds) {
	combat.session.transition('pursue', 'target-memory');
	moveMinimalEnemy(
		combat,
		minimalEnemyApproachVector(combat.actor, combat.runtime),
		deltaSeconds,
		1.08,
		'chase'
	);
	return true;
}

export function advanceMinimalEnemyLocomotion(combat, distance, deltaSeconds, beginAction) {
	const next = minimalEnemyLocomotionState(combat, distance);
	if (next === 'melee-windup' || next === 'cast-windup') return beginAction(combat, next);
	combat.session.transition(next, 'range-policy');
	if (next === 'approach') return approach(combat, deltaSeconds);
	return reposition(combat, distance, deltaSeconds);
}

function approach(combat, deltaSeconds) {
	moveMinimalEnemy(
		combat,
		minimalEnemyApproachVector(combat.actor, combat.runtime),
		deltaSeconds,
		1.22,
		'chase'
	);
	return true;
}

function reposition(combat, distance, deltaSeconds) {
	const ranges = minimalEnemyCombatRanges(combat);
	const retreat = combat.session.role === 'caster' && distance < ranges.casterMinimum;
	const vector = retreat
		? minimalEnemyRetreatVector(combat.actor, combat.runtime)
		: minimalEnemyOrbitVector(combat.actor, combat.runtime);
	moveMinimalEnemy(combat, vector, deltaSeconds, retreat ? 1.05 : 0.58, 'chase');
	return true;
}
