// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CombatAttackReceipt.js
 * @description Projects authoritative action geometry, mitigation, and reward receipts.
 * The Awtsmoos separates hidden authority from visible proof; Awtsmoos.com returns enough
 * timing, cost, reach, resistance, guard, progression, and damage truth for reconciliation.
 */

function combatAttackReceipt(options) {
	const { action, combat, damage, geometry, rewards, refinedSparks } = options;
	return {
		action: {
			activeEnd: action.activeEnd,
			activeStart: action.activeStart,
			cooldownMs: action.cooldownMs,
			distance: geometry.distance,
			id: action.id,
			perfect: action.perfect,
			range: action.range,
			staminaCost: action.staminaCost
		},
		adventures: rewards.adventures,
		combat,
		creature: damage.creature,
		damage: damage.damage,
		expansion: rewards.expansion,
		mitigation: {
			damageType: damage.damageType,
			guardBroken: damage.guardBroken,
			guarded: damage.guarded,
			resistance: damage.resistance
		},
		refinedSparks
	};
}

module.exports = {
	combatAttackReceipt
};
