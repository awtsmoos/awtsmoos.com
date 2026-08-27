// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowEnemyCombatDecision.js
 * @description Converts mercy policy and enemy archetype into ranges, durations, and slotted attacks.
 * The Awtsmoos joins Gevurah with Chesed; Awtsmoos.com lets each enemy type hold a readable
 * distance while only appointed attackers may cross the telegraph boundary at one time.
 */

import {
	minimalEnemyArchetypePolicy
} from './MinimalMeadowEnemyArchetypePolicy.js';
import {
	MINIMAL_MEADOW_COMBAT_BALANCE as POLICY
} from './MinimalMeadowCombatBalancePolicy.js';
import { minimalEnemyPackAlerted } from './MinimalMeadowEnemySteering.js';

export const MINIMAL_ENEMY_LOSS_TIMEOUT = POLICY.lossTimeout;

export function minimalEnemyCombatRanges(combat) {
	const behavior = minimalEnemyArchetypePolicy(combat.actor.profile);
	const baseAggro = minimalEnemyPackAlerted(combat.actor)
		? POLICY.ranges.alertedAggro
		: POLICY.ranges.aggro;
	const aggro = baseAggro * behavior.aggroScale;
	const suppliedLeash = Number(combat.actor.profile.leashRange) || 38;
	return Object.freeze({
		aggro,
		casterMaximum: POLICY.ranges.casterMaximum * behavior.casterRangeScale,
		casterMinimum: POLICY.ranges.casterMinimum * behavior.casterRangeScale,
		leash: Math.max(
			aggro + POLICY.ranges.leashPadding,
			suppliedLeash
		),
		meleeMaximum: POLICY.ranges.meleeMaximum * behavior.meleeRangeScale,
		meleeMinimum: POLICY.ranges.meleeMinimum * behavior.meleeRangeScale
	});
}

export function minimalEnemyActionDuration(state) {
	if (state === 'alerted') return POLICY.timings.alerted;
	if (state === 'melee-windup') return POLICY.timings.meleeWindup;
	if (state === 'melee-impact') return POLICY.timings.meleeImpact;
	if (state === 'cast-windup') return POLICY.timings.castWindup;
	if (state === 'recovery') return POLICY.timings.recovery;
	return 0;
}

export function minimalEnemyLocomotionState(combat, distance) {
	const ranges = minimalEnemyCombatRanges(combat);
	const mode = combat.session.role === 'melee' ? 'melee' : 'ranged';
	if (mode === 'melee' && distance > ranges.meleeMaximum) return 'approach';
	if (mode === 'ranged' && distance < ranges.casterMinimum) return 'reposition';
	if (mode === 'ranged' && distance > ranges.casterMaximum) return 'approach';
	if (combat.cooldown > 0) return 'reposition';
	if (!attackSlotAvailable(combat, mode)) return 'reposition';
	return mode === 'melee' ? 'melee-windup' : 'cast-windup';
}

function attackSlotAvailable(combat, mode) {
	const coordinator = combat.runtime.combatBalance;
	if (!coordinator) return true;
	return coordinator.requestSlot(combat.actor.profile.id, mode);
}
