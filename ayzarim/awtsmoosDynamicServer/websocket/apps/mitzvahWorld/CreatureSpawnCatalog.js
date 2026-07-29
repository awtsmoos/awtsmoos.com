// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CreatureSpawnCatalog.js
 * @description Places bounded creatures in canonical region packages and encounter cells.
 * The Awtsmoos renews pasture, wilderness, and highlands in distinct places; Awtsmoos.com
 * keeps every spawn deterministic so clients and server authority perceive one shared world.
 */

const SPAWNS = Object.freeze([
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

function spawn(id, speciesId, x, y, z, regionId = 'lower-meadow') {
	return Object.freeze({ id, position: Object.freeze({ x, y, z }), regionId, speciesId });
}

module.exports = { SPAWNS };
