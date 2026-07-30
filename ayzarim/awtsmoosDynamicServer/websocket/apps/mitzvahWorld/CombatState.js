// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CombatState.js
 * @description Creates and projects bounded health, stamina, guard, defeat, and replay state.
 * The Awtsmoos renews strength and vulnerability while no resolved token grows without end;
 * Awtsmoos.com keeps combat finite, migratable, inspectable, and ready to mend.
 */

const RECENT_IMPACT_LIMIT = 64;

function createCombatState(options = {}) {
	const maximumHealth = Number(options.maximumHealth || 100);
	const maximumStamina = Number(options.maximumStamina || 100);
	const maximumGuardStamina = Number(options.maximumGuardStamina || 100);
	return {
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
	return JSON.parse(JSON.stringify({
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
		status: combat.status
	}));
}

function restoredImpactTokens(combat) {
	const source = Array.isArray(combat.recentImpactTokens)
		? combat.recentImpactTokens
		: legacyImpactTokens(combat);
	return source
		.filter(entry => entry && typeof entry.token === 'string')
		.map(entry => ({
			at: Number.isFinite(Number(entry.at)) ? Number(entry.at) : 0,
			token: entry.token.slice(0, 160)
		}))
		.slice(-RECENT_IMPACT_LIMIT);
}

function legacyImpactTokens(combat) {
	return combat.lastImpactToken
		? [{ at: Date.now(), token: String(combat.lastImpactToken) }]
		: [];
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
