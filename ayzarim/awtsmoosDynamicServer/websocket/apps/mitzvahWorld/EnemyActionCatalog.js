// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EnemyActionCatalog.js
 * @description Joins authoritative enemy timelines to canonical typed action identity.
 * The Awtsmoos renews warning before consequence and recovery after strain;
 * Awtsmoos.com keeps every hostile act readable, status-bearing, interruptible, and server-owned.
 */

const {
	enemyCombatDefinition
} = require('./CombatDefinitionCatalog.js');

const ACTIONS = Object.freeze({
	'beast-bite': action('beast-bite', 'melee', 520, 120, 850, 2.6, 1),
	'guardian-slam': action('guardian-slam', 'melee', 850, 180, 1200, 3.2, 1.35),
	'letter-bolt': action('letter-bolt', 'ranged', 900, 140, 1100, 12, 0.85),
	'letter-wave': action('letter-wave', 'area', 1200, 220, 1500, 7, 1.15),
	'reposition-step': action('reposition-step', 'dodge', 260, 100, 700, 0, 0),
	'ritual-heal': action('ritual-heal', 'heal', 1100, 120, 1800, 0, 0, { healing: 24 }),
	'shadow-strike': action('shadow-strike', 'melee', 650, 140, 900, 3, 1.05),
	'stone-guard': action('stone-guard', 'guard', 420, 700, 800, 0, 0, { guardStrength: 0.7 }),
	'summon-shades': action('summon-shades', 'summon', 1400, 150, 2200, 0, 0, { summonCount: 2 }),
	'summit-enrage': action('summit-enrage', 'enrage', 1000, 160, 1200, 0, 0, { damageScale: 1.3 }),
	'warden-cleave': action('warden-cleave', 'melee', 1050, 220, 1300, 4.5, 1.45),
	'warden-retreat': action('warden-retreat', 'retreat', 360, 120, 850, 0, 0)
});

function action(id, type, telegraphMs, activeMs, recoveryMs, range, damageMultiplier, extra = {}) {
	const combat = enemyCombatDefinition(id);
	if (!combat) throw new Error(`ENEMY_COMBAT_DEFINITION_REQUIRED:${id}`);
	return Object.freeze({
		activeMs,
		affinityId: combat.affinityId,
		applyStatusIds: Object.freeze([...(combat.applyStatusIds || [])]),
		authoritative: true,
		cancelable: true,
		canonicalActionId: combat.id,
		counterGuidance: combat.counterGuidance,
		damageMultiplier,
		danger: combat.danger,
		elementId: combat.elementId,
		englishName: combat.englishName,
		hebrewName: combat.hebrewName,
		id,
		interruptResistance: combat.interruptResistance || 0,
		range,
		recoveryMs,
		removeStatusIds: Object.freeze([...(combat.removeStatusIds || [])]),
		tags: Object.freeze([...(combat.tags || [])]),
		telegraphMs,
		type,
		...extra
	});
}

function enemyAction(actionId) {
	return ACTIONS[actionId] || null;
}

module.exports = { ACTIONS, enemyAction };
