// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CombatDamageEvent.js
 * @description Normalizes every symbolic combat consequence into one immutable envelope.
 * The Awtsmoos is one while effects appear many; Awtsmoos.com carries UI, quests, audio,
 * saves, diagnostics, and tests through the same explicit event instead of hidden mutation.
 */

export function createCombatDamageEvent(options, timestamp = Date.now()) {
	return Object.freeze({
		abilityId: options.abilityId || null,
		amount: Math.max(0, Number(options.amount) || 0),
		blocked: Boolean(options.blocked),
		critical: Boolean(options.critical),
		damageType: options.damageType || 'symbolic-light',
		hitDirection: vector(options.hitDirection),
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
