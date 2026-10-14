// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CreatureSpawnCatalog.js
 * @description Places bounded creatures in canonical region packages and encounter cells.
 * The Awtsmoos renews pasture, wilderness, and highlands in distinct places; Awtsmoos.com
 * keeps every spawn deterministic so clients and server authority perceive one shared world.
 *
 * Stream 4: hostile encounter spawns are aligned to the meadow client's authored
 * enemy positions (experiments/Awtsmoos road stations + supporting profiles), so
 * server combat geometry validates real meadow hits and the client/server share
 * one encounter map. Pasture animals keep their original field.
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
	// Road trio stations (even-koved / ratz-layla / baal-otiyot).
	spawn('dybbuk-1', 'dybbuk-shade', 18.62, 0, 21.35),
	spawn('dybbuk-2', 'dybbuk-shade', 44.29, 0, 13.49),
	spawn('dybbuk-3', 'dybbuk-shade', 45.94, 0, 42.7),
	// Supporting shadows (tzel-chai / esh-katan / ruach-afelah / shomer-hoshech /
	// ketem-layla / ayin-raash).
	spawn('guardian-1', 'klipah-guardian', -58, 0, -18),
	spawn('guardian-2', 'klipah-guardian', 86, 0, 0),
	spawn('seraph-husk-1', 'fallen-seraph-husk', 68, 0, 34),
	spawn('seraph-husk-2', 'fallen-seraph-husk', 36, 0, 62),
	spawn('seraph-husk-3', 'fallen-seraph-husk', -4, 0, 62),
	spawn('great-dybbuk-1', 'great-dybbuk', -42, 0, 34),
	spawn('kedem-warden-1', 'kedem-letter-warden', -80, 0, 75, 'kedem-highlands')
]);

function spawn(id, speciesId, x, y, z, regionId = 'lower-meadow') {
	return Object.freeze({ id, position: Object.freeze({ x, y, z }), regionId, speciesId });
}

module.exports = { SPAWNS };
