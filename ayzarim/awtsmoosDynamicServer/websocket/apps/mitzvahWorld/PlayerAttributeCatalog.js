// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file PlayerAttributeCatalog.js
 * @description Defines the five bounded Shliach attributes and their derived effects.
 * The Awtsmoos renews wisdom, understanding, integration, courage, and protection;
 * Awtsmoos.com translates those lights into simple server-owned gameplay numbers.
 */

const ATTRIBUTE_CATALOG = Object.freeze({
	binah: attribute('Binah', '🧠', 'Cooldown recovery', 10),
	chochmah: attribute('Chochmah', '✨', 'Maximum focus', 10),
	daas: attribute('Daas', '🧭', 'Tracking range', 10),
	gevurah: attribute('Gevurah', '⚔️', 'Light damage', 10),
	haganah: attribute('Haganah', '🛡️', 'Armor', 10)
});

function createPlayerAttributes() {
	return Object.fromEntries(
		Object.keys(ATTRIBUTE_CATALOG).map(attributeId => [attributeId, 1])
	);
}

function derivedPlayerStats(player) {
	const attributes = player.shliach?.attributes || createPlayerAttributes();
	const level = Number(player.progression?.level || 1);
	return {
		armor: attributes.haganah * 3,
		cooldownMultiplier: Math.max(0.6, 1 - attributes.binah * 0.03),
		damageBonus: attributes.gevurah * 2,
		focusMaximum: 20 + attributes.chochmah * 4,
		powerRating: level * 10 + attributeTotal(attributes) * 5,
		trackingRange: 70 + attributes.daas * 15
	};
}

function attributeDefinition(attributeId) {
	return ATTRIBUTE_CATALOG[attributeId] || null;
}

function attributeTotal(attributes) {
	return Object.values(attributes).reduce((total, value) => total + Number(value || 0), 0);
}

function attribute(name, icon, effect, maximum) {
	return Object.freeze({ effect, icon, maximum, name });
}

module.exports = {
	ATTRIBUTE_CATALOG,
	attributeDefinition,
	createPlayerAttributes,
	derivedPlayerStats
};
