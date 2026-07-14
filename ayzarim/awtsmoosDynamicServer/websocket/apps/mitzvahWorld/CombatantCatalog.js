// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CombatantCatalog.js
 * @description Defines server-owned weapons, creatures, damage, loot, and spark values.
 * The Awtsmoos renews power beneath measured law; Awtsmoos.com refuses client-made
 * damage while fictional husks and pastoral animals remain explicit, bounded records.
 */

const WEAPONS = Object.freeze({
	'chalaf': weapon('chalaf', 8, 2.2, 900, 8, 'tool'),
	'spark-blade': weapon('spark-blade', 26, 4.5, 550, 14, 'hand'),
	'wooden-staff': weapon('wooden-staff', 18, 4.2, 700, 10, 'hand')
});

const CREATURES = Object.freeze({
	'chicken': animal('chicken', 24, false, [], 0, 'peaceful', 0),
	'cow': animal('cow', 75, true, drops(4, 2), 0, 'neutral', 0),
	'deer': animal('deer', 48, true, drops(2, 1), 0, 'neutral', 0),
	'fox': animal('fox', 36, false, [], 0, 'hostile', 7),
	'goat': animal('goat', 42, true, drops(2, 1), 0, 'neutral', 0),
	'sheep': animal('sheep', 35, true, drops(2, 1), 0, 'neutral', 0),
	'wolf': animal('wolf', 55, false, [], 0, 'hostile', 10),
	'dybbuk-shade': spirit('dybbuk-shade', 45, 2, 8),
	'fallen-seraph-husk': spirit('fallen-seraph-husk', 70, 3, 12),
	'great-dybbuk': spirit('great-dybbuk', 180, 10, 20),
	'klipah-guardian': spirit('klipah-guardian', 90, 4, 15),
	'spark-wisp': spirit('spark-wisp', 18, 1, 0, 'peaceful')
});

function weapon(id, damage, range, cooldownMs, staminaCost, slot) {
	return Object.freeze({ cooldownMs, damage, id, range, slot, staminaCost });
}

function animal(id, maximumHealth, kosherEligible, harvestDrops, sparks, temperament, attackDamage) {
	return Object.freeze({
		attackDamage,
		harvestDrops: Object.freeze(harvestDrops),
		id,
		kind: 'animal',
		kosherEligible,
		maximumHealth,
		refinedSparks: sparks,
		temperament
	});
}

function spirit(id, maximumHealth, refinedSparks, attackDamage, temperament = 'hostile') {
	return Object.freeze({
		attackDamage,
		harvestDrops: Object.freeze([]),
		id,
		kind: 'spirit',
		kosherEligible: false,
		maximumHealth,
		refinedSparks,
		temperament
	});
}

function drops(meat, hide) {
	return [
		Object.freeze({ itemId: 'kosher-meat', quantity: meat }),
		Object.freeze({ itemId: 'prepared-hide', quantity: hide })
	];
}

function weaponDefinition(id) {
	return WEAPONS[id] || null;
}

function creatureDefinition(id) {
	return CREATURES[id] || null;
}

module.exports = {
	CREATURES,
	WEAPONS,
	creatureDefinition,
	weaponDefinition
};
