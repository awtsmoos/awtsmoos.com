// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CombatAttackReceipt.js
 * @description Projects authoritative geometry, mitigation, affinity, reaction, and reward proof.
 * The Awtsmoos renews hidden judgment before the visible receipt can sing;
 * Awtsmoos.com reveals bounded diagnostics without letting the client crown itself king.
 */

function combatAttackReceipt(options) {
	const {
		action,
		combat,
		damage,
		geometry,
		rewards,
		refinedSparks
	} = options;
	return {
		action: actionReceipt(action, geometry),
		adventures: rewards.adventures,
		combat,
		creature: damage.creature,
		damage: damage.damage,
		effectiveness: effectivenessReceipt(damage),
		expansion: rewards.expansion,
		mitigation: mitigationReceipt(damage),
		refinedSparks,
		statuses: statusReceipt(damage)
	};
}

function actionReceipt(action, geometry) {
	return {
		activeEnd: action.activeEnd,
		activeStart: action.activeStart,
		affinityId: action.affinityId,
		cooldownMs: action.cooldownMs,
		distance: geometry.distance,
		elementId: action.elementId,
		id: action.id,
		perfect: action.perfect,
		range: action.range,
		staminaCost: action.staminaCost
	};
}

function effectivenessReceipt(damage) {
	const effectiveness = damage.effectiveness;
	if (!effectiveness) return null;
	return {
		baseDamage: effectiveness.baseDamage,
		criticalInteraction: effectiveness.criticalInteraction,
		diagnostics: [...(effectiveness.diagnostics || [])],
		finalDamage: effectiveness.damage,
		multiplier: effectiveness.multiplier
	};
}

function mitigationReceipt(damage) {
	return {
		damageType: damage.damageType,
		guardBroken: damage.guardBroken,
		guarded: damage.guarded,
		resistance: damage.resistance
	};
}

function statusReceipt(damage) {
	return {
		applied: [...(damage.reactions?.applied || [])],
		current: [...(damage.statuses || [])],
		removed: [...(damage.reactions?.removed || [])]
	};
}

module.exports = {
	combatAttackReceipt
};
