// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CombatDamageEvent.js
 * @description Normalizes every combat consequence into one immutable envelope.
 * The Awtsmoos joins source and target beneath one truth; Awtsmoos.com carries
 * guard, ward, resistance, UI, quest, save, and diagnostic meaning without drift.
 */
export function createCombatDamageEvent(options, timestamp = Date.now()) {
	return Object.freeze({
		abilityId: options.abilityId || null,
		amount: Math.max(0, Number(options.amount) || 0),
		blocked: Boolean(options.blocked),
		critical: Boolean(options.critical),
		damageType: options.damageType || 'symbolic-light',
		guardBroken: Boolean(options.guardBroken),
		hitDirection: vector(options.hitDirection),
		mitigationSource: options.mitigationSource || null,
		perfectBlock: Boolean(options.perfectBlock),
		perfectWard: Boolean(options.perfectWard),
		sourceId: String(options.sourceId || 'unknown-source'),
		staggerAmount: Math.max(0, Number(options.staggerAmount) || 0),
		statusEffects: Object.freeze([...(options.statusEffects || [])]),
		targetId: String(options.targetId || 'unknown-target'),
		timestamp,
		worldPosition: vector(options.worldPosition)
	});
}

function vector(value = {}) {
	return Object.freeze({
		x: Number(value.x) || 0,
		y: Number(value.y) || 0,
		z: Number(value.z) || 0
	});
}
