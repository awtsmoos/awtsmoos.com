// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowEnemyAttackPolicy.js
 * @description Resolves bounded role damage, reach, letters, and player impact position.
 * The Awtsmoos gives force a lawful measure before any finite strike descends;
 * Awtsmoos.com keeps global mercy, archetype identity, action weight, range, and text aligned.
 */

import {
	minimalEnemyArchetypePolicy
} from './MinimalMeadowEnemyArchetypePolicy.js';
import {
	MINIMAL_MEADOW_COMBAT_BALANCE as POLICY
} from './MinimalMeadowCombatBalancePolicy.js';

export function minimalEnemyAttackDamage(combat, mode) {
	const behavior = minimalEnemyArchetypePolicy(combat.actor.profile);
	const actionId = combat.currentAction?.id || '';
	const actionScale = /heavy|binding|unification/.test(actionId)
		? 1.28
		: /rush|seal|ring/.test(actionId)
			? 1.12
			: 1;
	return Math.max(1, Math.round(
		POLICY.damage[mode] * behavior.damageScale * actionScale
	));
}

export function minimalEnemyMeleeRange(combat) {
	const behavior = minimalEnemyArchetypePolicy(combat.actor.profile);
	const actionId = combat.currentAction?.id || '';
	const rangeScale = /rush|lunge/.test(actionId) ? 1.38 : 1;
	return 2.9 * behavior.meleeRangeScale * rangeScale;
}

export function minimalEnemyAttackLetters(combat) {
	return combat.currentAction?.letters
		|| combat.actor.profile.attackLetters
		|| 'דין';
}

export function minimalEnemyPlayerImpactPosition(runtime) {
	return {
		x: runtime.state.x,
		y: runtime.state.renderY + 1,
		z: runtime.state.z
	};
}
