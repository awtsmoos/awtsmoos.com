// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file LocalRpgCatalog.js
 * @description Mirrors stable combat, creature, spawn, and adventure definitions offline.
 * The Awtsmoos renews one law through server and local vessels; Awtsmoos.com keeps
 * deterministic single-player rules inspectable and protected by catalog-parity tests.
 */

export const LOCAL_RPG_WEAPONS = Object.freeze({
	chalaf: weapon('chalaf', 8, 2.2, 900, 8, 'tool'),
	'spark-blade': weapon('spark-blade', 26, 4.5, 550, 14, 'hand'),
	'wooden-staff': weapon('wooden-staff', 18, 4.2, 700, 10, 'hand')
});

export const LOCAL_RPG_CREATURES = Object.freeze({
	chicken: creature(24, false, 0),
	cow: creature(75, true, 0),
	deer: creature(48, true, 0),
	fox: creature(36, false, 0),
	goat: creature(42, true, 0),
	sheep: creature(35, true, 0),
	wolf: creature(55, false, 0),
	'dybbuk-shade': creature(45, false, 2),
	'fallen-seraph-husk': creature(70, false, 3),
	'great-dybbuk': creature(180, false, 10),
	'klipah-guardian': creature(90, false, 4),
	'spark-wisp': creature(18, false, 1)
});

export const LOCAL_CREATURE_SPAWNS = Object.freeze([
	spawn('sheep-1', 'sheep', 108, 38),
	spawn('sheep-2', 'sheep', 121, 47),
	spawn('goat-1', 'goat', 128, 32),
	spawn('cow-1', 'cow', 96, 52),
	spawn('deer-1', 'deer', 76, -72),
	spawn('chicken-1', 'chicken', -49, 19),
	spawn('fox-1', 'fox', 88, -94),
	spawn('wolf-1', 'wolf', 30, -124),
	spawn('dybbuk-1', 'dybbuk-shade', 0, -140),
	spawn('dybbuk-2', 'dybbuk-shade', 14, -146),
	spawn('dybbuk-3', 'dybbuk-shade', -12, -151),
	spawn('guardian-1', 'klipah-guardian', -20, -152),
	spawn('guardian-2', 'klipah-guardian', -31, -143),
	spawn('seraph-husk-1', 'fallen-seraph-husk', 24, -158),
	spawn('seraph-husk-2', 'fallen-seraph-husk', 36, -148),
	spawn('seraph-husk-3', 'fallen-seraph-husk', 12, -168),
	spawn('great-dybbuk-1', 'great-dybbuk', 8, -182)
]);

export const LOCAL_ADVENTURE_IDS = Object.freeze([
	'sparks-at-east-gate',
	'guard-the-shul',
	'shepherds-mercy',
	'kosher-provision',
	'orchard-defense',
	'wings-over-lake',
	'great-spark-refinement',
	'light-at-river-crossing'
]);

function weapon(id, damage, range, cooldownMs, staminaCost, slot) {
	return Object.freeze({ cooldownMs, damage, id, range, slot, staminaCost });
}
function creature(maximumHealth, kosherEligible, refinedSparks) {
	return Object.freeze({ kosherEligible, maximumHealth, refinedSparks });
}
function spawn(id, speciesId, x, z) {
	return Object.freeze({ id, position: Object.freeze({ x, y: 0, z }), speciesId });
}
