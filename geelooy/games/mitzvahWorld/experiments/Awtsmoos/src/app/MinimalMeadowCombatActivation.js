// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowCombatActivation.js
 * @description Routes one action through release, eligibility, acceptance, cost, and completion.
 * The Awtsmoos joins desire to lawful consequence without charging a rejected deed;
 * Awtsmoos.com keeps Kavanah, casting, melee, defense, stamina, and cooldown ordered.
 */

import {
	activateMinimalCombat,
	releaseMinimalCombat
} from './MinimalMeadowCombatCastRuntime.js';
import { launchMinimalCombatEffects } from './MinimalMeadowCombatEffectsAdapter.js';
import {
	combatActionRejection,
	completeCombatAction,
	spendCombatActionCost
} from './combat/CombatActionEligibility.js';
import { startMeleeAction } from './combat/MeleeActionRuntime.js';

export function activateMinimalMeadowAction(combat, actions, actionId) {
	const action = actions[actionId];
	if (!action) return combat.reject('UNKNOWN_ACTION', { actionId });
	if (combat.cast?.actionId === actionId && action.kavanah) {
		return releaseMinimalCombat(combat, launchMinimalCombatEffects);
	}
	const rejection = combatActionRejection(combat, action);
	if (rejection) return combat.reject(rejection, { actionId });
	if (action.type === 'cast') {
		return beginAcceptedAction(
			combat,
			action,
			activateMinimalCombat(combat, actions, actionId)
		);
	}
	if (action.type === 'melee') {
		return beginAcceptedAction(
			combat,
			action,
			startMeleeAction(combat, action, actionId)
		);
	}
	spendCombatActionCost(combat, action);
	combat.runtime.bus.emit('combat:defense-intent', { action, actionId });
	combat.cooldowns.set(actionId, combat.clock + action.cooldown);
	completeCombatAction(combat, action);
	combat.publishCooldowns(true);
	return { accepted: true, actionId };
}

function beginAcceptedAction(combat, action, result) {
	if (result?.accepted) spendCombatActionCost(combat, action);
	return result;
}
