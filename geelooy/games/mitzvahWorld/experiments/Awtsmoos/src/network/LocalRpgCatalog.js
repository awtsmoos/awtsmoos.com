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
	'kedem-letter-warden': creature(520, false, 25),
	'klipah-guardian': creature(90, false, 4),
	'spark-wisp': creature(18, false, 1)
});

export const LOCAL_CREATURE_SPAWNS = Object.freeze([
	spawn('sheep-1', 'sheep', 108, 0, 38),
	spawn('sheep-2', 'sheep', 121, 0, 47),
	spawn('goat-1', 'goat', 128, 0, 32),
	spawn('cow-1', 'cow', 96, 0, 52),
	spawn('deer-1', 'deer', 76, 0, -72),
	spawn('chicken-1', 'chicken', -49, 0, 19),
	spawn('fox-1', 'fox', 88, 0, -94),
	spawn('wolf-1', 'wolf', 30, 0, -124),
	spawn('dybbuk-1', 'dybbuk-shade', 0, 0, -140),
	spawn('dybbuk-2', 'dybbuk-shade', 14, 0, -146),
	spawn('dybbuk-3', 'dybbuk-shade', -12, 0, -151),
	spawn('guardian-1', 'klipah-guardian', -20, 0, -152),
	spawn('guardian-2', 'klipah-guardian', -31, 0, -143),
	spawn('seraph-husk-1', 'fallen-seraph-husk', 24, 0, -158),
	spawn('seraph-husk-2', 'fallen-seraph-husk', 36, 0, -148),
	spawn('seraph-husk-3', 'fallen-seraph-husk', 12, 0, -168),
	spawn('great-dybbuk-1', 'great-dybbuk', 8, 0, -182),
	spawn('kedem-warden-1', 'kedem-letter-warden', -106, 2.2864, 101, 'kedem-highlands')
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

function spawn(id, speciesId, x, y, z, regionId = 'lower-meadow') {
	return Object.freeze({
		id,
		position: Object.freeze({ x, y, z }),
		regionId,
		speciesId
	});
}
