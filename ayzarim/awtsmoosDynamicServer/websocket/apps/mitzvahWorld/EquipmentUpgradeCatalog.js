// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EquipmentUpgradeCatalog.js
 * @description Declares material-gated weapon, shield, coat, and boot upgrade choices.
 * The Awtsmoos reveals growth through changed action rather than empty number alone;
 * Awtsmoos.com keeps item, level, materials, stats, mastery, and unlock identity inspectable.
 */

const UPGRADES = Object.freeze({
	'boots-trail-soles': upgrade('walking-boots', 2, {
		'cedar-wood': 2,
		'river-stone': 1
	}, { environmentalResistance: 0.04, movementSpeed: 0.03, recoverySpeed: 0.05 }),
	'coat-ridge-lining': upgrade('black-coat', 3, {
		'ridge-herb': 4,
		'wool-thread': 3
	}, { maxHealth: 8, spiritualResistance: 0.04, staggerResistance: 0.05 }),
	'shield-river-binding': upgrade('village-shield', 3, {
		'guardian-stone': 2,
		'river-stone': 4
	}, { areaResistance: 0.05, blockStrength: 0.08, guardStamina: 18 }),
	'staff-oak-binding': upgrade('wooden-staff', 2, {
		'cedar-wood': 3,
		'staff-splinter': 2
	}, { guardStamina: 8, masteryGain: 0.08, reach: 0.18, stagger: 3 }),
	'sword-letter-edge': upgrade('spark-blade', 4, {
		'letter-fragment': 4,
		'warden-seal': 1
	}, { criticalChance: 0.06, masteryGain: 0.1, perfectTiming: 0.025, stagger: 4 })
});

function upgrade(itemId, requiredLevel, materials, modifiers) {
	return Object.freeze({
		itemId,
		materials: Object.freeze(materials),
		modifiers: Object.freeze(modifiers),
		requiredLevel
	});
}

function equipmentUpgrade(upgradeId) {
	return UPGRADES[upgradeId] || null;
}

module.exports = {
	UPGRADES,
	equipmentUpgrade
};
