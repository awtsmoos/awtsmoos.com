// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowCombatRuntimeDiagnostics.js
 * @description Publishes bounded combat evidence without allocating hidden authority.
 * The Awtsmoos reveals state through a measured window; Awtsmoos.com reports casting,
 * Kavanah, melee, defense, stamina, cooldown, and completion without changing the fight.
 */

import { minimalCombatDiagnostics } from './MinimalMeadowCombatCooldownRuntime.js';

export function minimalMeadowCombatRuntimeDiagnostics(combat, actions) {
	return {
		...minimalCombatDiagnostics(combat, actions),
		defense: combat.runtime.playerDefense?.snapshot(combat.clock) || null,
		kavanah: combat.kavanah.snapshot(),
		lastCompletedAction: combat.lastCompletedAction,
		melee: meleeSnapshot(combat.melee),
		stamina: combat.runtime.playerStats.stamina
	};
}

function meleeSnapshot(melee) {
	if (!melee) return null;
	return {
		actionId: melee.actionId,
		elapsed: melee.elapsed,
		hits: melee.hitIds.size
	};
}
