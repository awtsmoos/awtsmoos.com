// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CombatState.js
 * @description Creates and projects bounded health, stamina, guard, status, defeat, and replay state.
 * The Awtsmoos renews strength and vulnerability while no status or token grows without end;
 * Awtsmoos.com keeps combat finite, migratable, inspectable, and ready to mend.
 */

const {
	restoredImpactTokens,
	restoredStatuses
} = require('./CombatStateRestore.js');

function createCombatState(options = {}) {
	const maximumHealth = Number(options.maximumHealth || 100);
	const maximumStamina = Number(options.maximumStamina || 100);
	const maximumGuardStamina = Number(options.maximumGuardStamina || 100);
	return {
		combatStatuses: [],
		defeatedAt: null,
		guardActionId: null,
		guardBrokenUntil: null,
		guardFacing: 0,
		guardStamina: maximumGuardStamina,
		guardUntil: null,
		health: maximumHealth,
		lastAttackAt: 0,
		lastImpactToken: null,
		maximumGuardStamina,
		maximumHealth,
		maximumStamina,
		parryUntil: null,
		recentImpactTokens: [],
		stamina: maximumStamina,
		status: 'active'
	};
}

function restoreCombatState(combat = {}) {
	const defaults = createCombatState(combat);
	return {
		...defaults,
		...combat,
		combatStatuses: restoredStatuses(combat.combatStatuses),
		guardStamina: bounded(
			combat.guardStamina ?? defaults.guardStamina,
			0,
			defaults.maximumGuardStamina
		),
		health: bounded(combat.health ?? defaults.health, 0, defaults.maximumHealth),
		recentImpactTokens: restoredImpactTokens(combat),
		stamina: bounded(combat.stamina ?? defaults.stamina, 0, defaults.maximumStamina)
	};
}

function reviveCombatState(combat) {
	combat.combatStatuses = [];
	combat.defeatedAt = null;
	combat.guardActionId = null;
	combat.guardBrokenUntil = null;
	combat.guardStamina = combat.maximumGuardStamina;
	combat.guardUntil = null;
	combat.health = combat.maximumHealth;
	combat.lastImpactToken = null;
	combat.parryUntil = null;
	combat.recentImpactTokens = [];
	combat.stamina = combat.maximumStamina;
	combat.status = 'active';
	return combatSnapshot(combat);
}

function combatSnapshot(combat) {
	return clone({
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

function bounded(value, minimum, maximum) {
	return Math.max(minimum, Math.min(maximum, Number(value)));
}

function clone(value) {
	return JSON.parse(JSON.stringify(value));
}

module.exports = {
	combatSnapshot,
	createCombatState,
	restoreCombatState,
	reviveCombatState
};
