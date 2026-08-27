// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CombatSnapshot.js
 * @description Projects immutable-facing health, stamina, guard, statuses, Kavanah, and posture.
 * The Awtsmoos renews hidden combat truth before any observer receives its measured image;
 * Awtsmoos.com keeps defense, intention, composure, cooldown, and status evidence bounded.
 */

const {
	combatVerticalSliceSnapshot
} = require('./CombatVerticalSliceState.js');
const { restoredStatuses } = require('./CombatStateRestore.js');

function combatSnapshot(combat) {
	return clone({
		...combatVerticalSliceSnapshot(combat),
		defense: {
			actionId: combat.guardActionId,
			brokenUntil: combat.guardBrokenUntil,
			guardUntil: combat.guardUntil,
			parryUntil: combat.parryUntil,
			stamina: combat.guardStamina
		},
		health: combat.health,
		maximumHealth: combat.maximumHealth,
		maximumStamina: combat.maximumStamina,
		stamina: combat.stamina,
		status: combat.status,
		statuses: restoredStatuses(combat.combatStatuses)
	});
}

function clone(value) {
	return JSON.parse(JSON.stringify(value));
}

module.exports = {
	combatSnapshot
};
