// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file PlayerCombatActionCatalog.js
 * @description Joins server-owned timing and balance to canonical shared combat identities.
 * The Awtsmoos renews each measured deed while the client can author neither force nor name;
 * Awtsmoos.com preserves established windows and weapons beneath one typed action flame.
 */

const {
	playerCombatDefinition: sharedPlayerCombatDefinition
} = require('./CombatDefinitionCatalog.js');

const ACTIONS = Object.freeze(Object.fromEntries([
	cast('hebrew-fire', 1.65, 4.2, 34, 1.45, 14, 2500),
	cast('letter-light', 1.1, 4.2, 38, 1.1, 9, 1850),
	cast('staff-cast', 0.62, 4.2, 34, 0.9, 7, 1200),
	melee('chalaf-harvest', 'chalaf', 0.22, 0.38, 2.2, 55, 1.6, 1, 8, 900),
	melee('staff-light', 'wooden-staff', 0.18, 0.31, 3.8, 72, 2.1, 0.85, 10, 620),
	melee('staff-follow', 'wooden-staff', 0.16, 0.30, 4, 82, 2.1, 0.95, 11, 660),
	melee('staff-heavy', 'wooden-staff', 0.42, 0.66, 4.5, 145, 2.1, 1.55, 24, 1450),
	melee('staff-shove', 'wooden-staff', 0.25, 0.39, 3.2, 58, 2.1, 0.55, 18, 1100),
	melee('sword-light', 'spark-blade', 0.14, 0.27, 3.6, 78, 1.8, 1, 9, 500),
	melee('sword-follow', 'spark-blade', 0.13, 0.27, 3.7, 88, 1.8, 1.08, 10, 520),
	melee('sword-finish', 'spark-blade', 0.24, 0.41, 4, 104, 1.8, 1.45, 18, 950),
	melee('sword-heavy', 'spark-blade', 0.48, 0.69, 4.2, 70, 1.8, 1.8, 26, 1550)
]));

function cast(id, elapsed, range, arcDegrees, multiplier, staminaCost, cooldownMs) {
	return record({
		activeEnd: elapsed + 0.25,
		activeStart: elapsed - 0.08,
		arcDegrees,
		cooldownMs,
		damageMultiplier: multiplier,
		id,
		kind: 'cast',
		range,
		staminaCost,
		verticalTolerance: 3,
		weaponId: 'wooden-staff'
	});
}

function melee(id, weaponId, activeStart, activeEnd, range, arcDegrees, verticalTolerance, damageMultiplier, staminaCost, cooldownMs) {
	return record({
		activeEnd,
		activeStart,
		arcDegrees,
		cooldownMs,
		damageMultiplier,
		id,
		kind: 'melee',
		range,
		staminaCost,
		verticalTolerance,
		weaponId
	});
}

function record(balance) {
	const combat = sharedPlayerCombatDefinition(balance.id);
	if (!combat) throw new Error(`PLAYER_COMBAT_DEFINITION_REQUIRED:${balance.id}`);
	return [balance.id, Object.freeze({
		...balance,
		affinityId: combat.affinityId,
		applyStatusIds: Object.freeze([...(combat.applyStatusIds || [])]),
		canonicalActionId: combat.id,
		danger: combat.danger,
		elementId: combat.elementId,
		englishName: combat.englishName,
		guardDamage: combat.guardDamage || 0,
		hebrewName: combat.hebrewName,
		interruptForce: combat.interruptForce || 0,
		removeStatusIds: Object.freeze([...(combat.removeStatusIds || [])]),
		stagger: combat.stagger || 0,
		tags: Object.freeze([...(combat.tags || [])])
	})];
}

function playerCombatAction(actionId) {
	if (ACTIONS[actionId]) return ACTIONS[actionId];
	const combat = sharedPlayerCombatDefinition(actionId);
	return combat ? ACTIONS[combat.id] || null : null;
}

module.exports = { ACTIONS, playerCombatAction };
