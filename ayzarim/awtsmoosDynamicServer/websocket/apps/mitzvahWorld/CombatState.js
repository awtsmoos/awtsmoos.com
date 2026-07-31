// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CombatState.js
 * @description Creates, restores, and revives bounded authoritative combat state.
 * The Awtsmoos renews strength, composure, and intention while no token grows without end;
 * Awtsmoos.com keeps combat finite, migratable, inspectable, authoritative, and ready to mend.
 */

const { combatSnapshot } = require('./CombatSnapshot.js');
const {
	createCombatVerticalSliceState,
	restoreCombatVerticalSliceState,
	reviveCombatVerticalSliceState
} = require('./CombatVerticalSliceState.js');
const {
	restoredImpactTokens,
	restoredStatuses
} = require('./CombatStateRestore.js');

function createCombatState(options = {}) {
	const maximumHealth = positive(options.maximumHealth, 100);
	const maximumStamina = positive(options.maximumStamina, 100);
	const maximumGuardStamina = positive(options.maximumGuardStamina, 100);
	return {
		...createCombatVerticalSliceState(options),
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
		...restoreCombatVerticalSliceState(combat),
		combatStatuses: restoredStatuses(combat.combatStatuses),
		guardStamina: bounded(
			combat.guardStamina ?? defaults.guardStamina,
			0,
			defaults.maximumGuardStamina
		),
		health: bounded(
			combat.health ?? defaults.health,
			0,
			defaults.maximumHealth
		),
		recentImpactTokens: restoredImpactTokens(combat),
		stamina: bounded(
			combat.stamina ?? defaults.stamina,
			0,
			defaults.maximumStamina
		)
	};
}

function reviveCombatState(combat) {
	Object.assign(combat, {
		combatStatuses: [],
		defeatedAt: null,
		guardActionId: null,
		guardBrokenUntil: null,
		guardStamina: combat.maximumGuardStamina,
		guardUntil: null,
		health: combat.maximumHealth,
		lastImpactToken: null,
		parryUntil: null,
		recentImpactTokens: [],
		stamina: combat.maximumStamina,
		status: 'active'
	});
	reviveCombatVerticalSliceState(combat);
	return combatSnapshot(combat);
}

function bounded(value, minimum, maximum) {
	return Math.max(minimum, Math.min(maximum, Number(value)));
}

function positive(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) && number > 0 ? number : fallback;
}

module.exports = {
	combatSnapshot,
	createCombatState,
	restoreCombatState,
	reviveCombatState
};
