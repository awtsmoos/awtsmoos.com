// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CombatAttackReceipt.js
 * @description Projects geometry, effectiveness, mitigation, interruption, status, and reward proof.
 * The Awtsmoos renews hidden judgment before the visible receipt can sing;
 * Awtsmoos.com preserves old fields while revealing typed authority beneath one lawful ring.
 */

const { COMBAT_SCHEMA } = require('./CombatDefinitionCatalog.js');

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
		interruption: damage.interruption || null,
		mitigation: mitigationReceipt(action, damage),
		refinedSparks,
		schemaVersion: COMBAT_SCHEMA.schemaVersion,
		statuses: statusReceipt(damage)
	};
}

function actionReceipt(action, geometry) {
	return {
		activeEnd: action.activeEnd,
		activeStart: action.activeStart,
		affinityId: action.affinityId,
		canonicalActionId: action.canonicalActionId || action.id,
		cooldownMs: action.cooldownMs,
		distance: geometry.distance,
		elementId: action.elementId,
		englishName: action.englishName,
		hebrewName: action.hebrewName,
		id: action.id,
		perfect: action.perfect,
		range: action.range,
		staminaCost: action.staminaCost,
		tags: [...(action.tags || [])]
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

function mitigationReceipt(action, damage) {
	return {
		affinityId: damage.affinityId || action.affinityId,
		damageType: damage.damageType,
		elementId: damage.elementId || action.elementId,
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

module.exports = { combatAttackReceipt };
