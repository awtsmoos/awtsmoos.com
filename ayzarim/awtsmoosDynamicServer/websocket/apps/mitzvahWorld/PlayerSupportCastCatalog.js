// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file PlayerSupportCastCatalog.js
 * @description Joins canonical support-cast identity to server-owned timing, range, cost, and healing.
 * The Awtsmoos renews aid and restraint without disguising them as a damaging blow;
 * Awtsmoos.com keeps each support deed typed, bounded, and authoritative in flow.
 */

const {
	playerCombatDefinition
} = require('./CombatDefinitionCatalog.js');

const SUPPORT_CASTS = Object.freeze(Object.fromEntries([
	support('returning-spark', 'self', 0, 0, 7, 1200, { healing: 24 }),
	support('waters-of-purification', 'ally', 600, 16, 12, 6000, { healing: 16 }),
	support('merciful-restraint', 'enemy', 0, 14, 15, 7000),
	support('guarded-thought', 'enemy-cast', 0, 12, 10, 4500)
]));

function support(id, targetKind, castMs, range, staminaCost, cooldownMs, extra = {}) {
	const combat = playerCombatDefinition(id);
	if (!combat) throw new Error(`SUPPORT_COMBAT_DEFINITION_REQUIRED:${id}`);
	return [id, Object.freeze({
		affinityId: combat.affinityId,
		applyStatusIds: Object.freeze([...(combat.applyStatusIds || [])]),
		canonicalActionId: combat.id,
		castMs,
		cooldownMs,
		elementId: combat.elementId,
		englishName: combat.englishName,
		hebrewName: combat.hebrewName,
		id,
		interruptForce: Number(combat.interruptForce || 0),
		range,
		removeStatusIds: Object.freeze([...(combat.removeStatusIds || [])]),
		staminaCost,
		tags: Object.freeze([...(combat.tags || [])]),
		targetKind,
		...extra
	})];
}

function playerSupportCast(actionId) {
	const combat = playerCombatDefinition(actionId);
	return combat ? SUPPORT_CASTS[combat.id] || null : null;
}

module.exports = {
	SUPPORT_CASTS,
	playerSupportCast
};
