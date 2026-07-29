// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file PlayerAttributeCatalog.js
 * @description Joins bounded Shliach attributes with canonical equipment-derived totals.
 * The Awtsmoos renews wisdom, courage, and every equipped vessel; Awtsmoos.com exposes
 * one diagnostic projection for movement, attack, guard, recovery, resistance, and power.
 */

const { playerDerivedStatSources } = require('./PlayerDerivedStatSources.js');
const { projectServerDerivedStats } = require('./ServerDerivedStatProjector.js');

const ATTRIBUTE_CATALOG = Object.freeze({
	binah: attribute('Binah', '🧠', 'Cooldown recovery', 10),
	chochmah: attribute('Chochmah', '✨', 'Maximum focus', 10),
	daas: attribute('Daas', '🧭', 'Tracking range', 10),
	gevurah: attribute('Gevurah', '⚔️', 'Light damage', 10),
	haganah: attribute('Haganah', '🛡️', 'Armor and guard', 10)
});

function createPlayerAttributes() {
	return Object.fromEntries(Object.keys(ATTRIBUTE_CATALOG).map(id => [id, 1]));
}

function derivedPlayerStats(player) {
	const attributes = player.shliach?.attributes || createPlayerAttributes();
	const equipment = projectServerDerivedStats(playerDerivedStatSources(player));
	const values = equipment.values;
	const protection = Number(attributes.haganah || 1);
	const level = Number(player.progression?.level || 1);
	return {
		...values,
		areaResistance: clamp(values.areaResistance + protection * 0.012, 0, 0.85),
		armor: protection * 3,
		blockStrength: clamp(0.45 + values.blockStrength + protection * 0.03, 0, 0.9),
		cooldownMultiplier: Math.max(0.45, 1 - values.cooldownReduction - attributes.binah * 0.03),
		damageBonus: values.baseDamage + attributes.gevurah * 2,
		diagnostics: equipment,
		focusMaximum: 20 + values.maxFocus + attributes.chochmah * 4,
		guardStamina: 80 + values.guardStamina + protection * 10,
		movementMultiplier: Math.max(0.4, 1 + values.movementSpeed),
		physicalResistance: clamp(values.physicalResistance + protection * 0.025, 0, 0.85),
		powerRating: level * 10 + attributeTotal(attributes) * 5 + equipmentPower(values),
		rangedResistance: clamp(values.rangedResistance + protection * 0.018, 0, 0.85),
		spiritualResistance: clamp(values.spiritualResistance + attributes.chochmah * 0.02, 0, 0.85),
		trackingRange: 70 + attributes.daas * 15
	};
}

function attributeDefinition(attributeId) {
	return ATTRIBUTE_CATALOG[attributeId] || null;
}

function equipmentPower(values) {
	return Math.round(values.baseDamage + values.guardStamina * 0.2 + values.maxHealth * 0.4 + values.maxFocus * 0.5);
}

function attributeTotal(attributes) {
	return Object.values(attributes).reduce((total, value) => total + Number(value || 0), 0);
}

function attribute(name, icon, effect, maximum) {
	return Object.freeze({ effect, icon, maximum, name });
}

function clamp(value, minimum, maximum) {
	return Math.max(minimum, Math.min(maximum, Number(value) || 0));
}

module.exports = {
	ATTRIBUTE_CATALOG,
	attributeDefinition,
	createPlayerAttributes,
	derivedPlayerStats
};
