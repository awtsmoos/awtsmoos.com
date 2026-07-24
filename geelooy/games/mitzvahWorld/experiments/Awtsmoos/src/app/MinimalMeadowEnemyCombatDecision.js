// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowEnemyCombatDecision.js
 * @description Defines bounded encounter ranges, durations, and next locomotion choices.
 * The Awtsmoos joins mercy and limit; Awtsmoos.com keeps aggro smaller than leash,
 * melee close, casting useful, and target loss deliberate rather than instantaneous.
 */

import { minimalEnemyPackAlerted } from './MinimalMeadowEnemySteering.js';

export const MINIMAL_ENEMY_LOSS_TIMEOUT = 4.2;

export function minimalEnemyCombatRanges(combat) {
	const aggro = minimalEnemyPackAlerted(combat.actor) ? 29 : 20;
	const suppliedLeash = Number(combat.actor.profile.leashRange) || 38;
	return Object.freeze({
		aggro,
		casterMaximum: 11.5,
		casterMinimum: 5.4,
		leash: Math.max(aggro + 12, suppliedLeash),
		meleeMaximum: 2.65,
		meleeMinimum: 1.85
	});
}

export function minimalEnemyActionDuration(state) {
	if (state === 'alerted') return 0.24;
	if (state === 'melee-windup') return 0.48;
	if (state === 'melee-impact') return 0.55;
	if (state === 'cast-windup') return 1.05;
	if (state === 'recovery') return 0.58;
	return 0;
}

export function minimalEnemyLocomotionState(combat, distance) {
	const ranges = minimalEnemyCombatRanges(combat);
	if (combat.session.role === 'melee') {
		if (distance > ranges.meleeMaximum) return 'approach';
		return combat.cooldown === 0 ? 'melee-windup' : 'reposition';
	}
	if (distance < ranges.casterMinimum) return 'reposition';
	if (distance > ranges.casterMaximum) return 'approach';
	return combat.cooldown === 0 ? 'cast-windup' : 'reposition';
}
