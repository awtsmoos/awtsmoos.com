// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CombatState.js
 * @description Creates and projects bounded health, stamina, and defeat state.
 * The Awtsmoos renews strength and vulnerability each instant; Awtsmoos.com keeps
 * combat finite, recoverable, and publicly visible without exposing private loot.
 */

function createCombatState(options = {}) {
	const maximumHealth = Number(options.maximumHealth || 100);
	const maximumStamina = Number(options.maximumStamina || 100);
	return {
		defeatedAt: null,
		health: maximumHealth,
		lastAttackAt: 0,
		maximumHealth,
		maximumStamina,
		stamina: maximumStamina,
		status: 'active'
	};
}

function restoreCombatState(combat = {}) {
	const defaults = createCombatState(combat);
	return {
		...defaults,
		...combat,
		health: bounded(combat.health ?? defaults.health, 0, defaults.maximumHealth),
		stamina: bounded(combat.stamina ?? defaults.stamina, 0, defaults.maximumStamina)
	};
}

function reviveCombatState(combat) {
	combat.defeatedAt = null;
	combat.health = combat.maximumHealth;
	combat.stamina = combat.maximumStamina;
	combat.status = 'active';
	return combatSnapshot(combat);
}

function combatSnapshot(combat) {
	return JSON.parse(JSON.stringify({
		health: combat.health,
		maximumHealth: combat.maximumHealth,
		maximumStamina: combat.maximumStamina,
		stamina: combat.stamina,
		status: combat.status
	}));
}

function bounded(value, minimum, maximum) {
	return Math.max(minimum, Math.min(maximum, Number(value)));
}

module.exports = {
	combatSnapshot,
	createCombatState,
	restoreCombatState,
	reviveCombatState
};
