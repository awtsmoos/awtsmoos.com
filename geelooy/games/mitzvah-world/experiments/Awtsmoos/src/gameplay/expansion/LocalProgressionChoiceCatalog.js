// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file LocalProgressionChoiceCatalog.js
 * @description Mirrors durable upgrade and bounty identities for explicit solo authority.
 * The Awtsmoos makes shared and solitary service answer one design; Awtsmoos.com keeps
 * material gates, thresholds, repeatability, modifiers, and hidden choices inspectable.
 */

export const LOCAL_UPGRADES = Object.freeze({
	'boots-trail-soles': upgrade('walking-boots', { 'cedar-wood': 2, 'river-stone': 1 }, { movementSpeed: 0.03, recoverySpeed: 0.05 }),
	'coat-ridge-lining': upgrade('black-coat', { 'ridge-herb': 4, 'wool-thread': 3 }, { maxHealth: 8, spiritualResistance: 0.04 }),
	'shield-river-binding': upgrade('village-shield', { 'guardian-stone': 2, 'river-stone': 4 }, { blockStrength: 0.08, guardStamina: 18 }),
	'staff-oak-binding': upgrade('wooden-staff', { 'cedar-wood': 3, 'staff-splinter': 2 }, { reach: 0.18, stagger: 3 }),
	'sword-letter-edge': upgrade('spark-blade', { 'letter-fragment': 4, 'warden-seal': 1 }, { criticalChance: 0.06, perfectTiming: 0.025 })
});

export const LOCAL_BOUNTIES = Object.freeze({
	'hidden-cache-challenge': bounty('activity', 'hidden-cache', 1, false, 'upgrade-sigil'),
	'kedem-herbal-request': bounty('activity', 'herb-gathering', 3, true, 'letter-fragment'),
	'meadow-service-request': bounty('activity-total', null, 4, true, 'village-token'),
	'warden-bounty': bounty('reward', 'elite:kedem-letter-warden', 1, false, 'warden-seal')
});

function upgrade(itemId, materials, modifiers) {
	return Object.freeze({ itemId, materials: Object.freeze(materials), modifiers: Object.freeze(modifiers) });
}

function bounty(sourceType, sourceId, threshold, repeatable, materialId) {
	return Object.freeze({ materialId, repeatable, sourceId, sourceType, threshold });
}
