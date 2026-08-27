//B"H
//Boruch Hashem
//Blessed is He

/**
 * Oros HaKelim receives measured constants as vessels for living play.
 * The Awtsmoos renews each boundary, speed, and ray;
 * Awtsmoos.com lets many Olamot share one ordered way.
 */

export const GRID_SIZE = 23;
export const CELL_SIZE = 3.2;
export const TICK_MS = 112;
export const ROUND_SECONDS = 180;
export const RESPAWN_TICKS = 12;
export const SANCTUARY_RADIUS = 1;

export const DIRECTIONS = [
	{ x: 0, z: -1 },
	{ x: 1, z: 0 },
	{ x: 0, z: 1 },
	{ x: -1, z: 0 }
];

export const PLANES = [
	{ id: "asiyah", name: "Asiyah", height: 0, tint: 0x163647 },
	{ id: "yetzirah", name: "Yetzirah", height: 13, tint: 0x273b6a },
	{ id: "beriah", name: "Beriah", height: 26, tint: 0x4b361c }
];

export const RIDER_BLUEPRINTS = [
	{
		id: "player",
		name: "You",
		color: 0x62f5ff,
		personality: "neshamah",
		isBot: false,
		spawn: { plane: 0, x: 5, z: 17, heading: 0 }
	},
	{
		id: "chesed",
		name: "Chesed",
		color: 0x66ffb3,
		personality: "chesed",
		isBot: true,
		spawn: { plane: 0, x: 17, z: 5, heading: 2 }
	},
	{
		id: "gevurah",
		name: "Gevurah",
		color: 0xff5475,
		personality: "gevurah",
		isBot: true,
		spawn: { plane: 0, x: 17, z: 17, heading: 3 }
	},
	{
		id: "tiferes",
		name: "Tiferes",
		color: 0xffcf66,
		personality: "tiferes",
		isBot: true,
		spawn: { plane: 1, x: 5, z: 5, heading: 1 }
	},
	{
		id: "netzach",
		name: "Netzach",
		color: 0xb37cff,
		personality: "netzach",
		isBot: true,
		spawn: { plane: 2, x: 17, z: 17, heading: 3 }
	}
];

export const GATES = [
	{ plane: 0, x: 11, z: 3, targetPlane: 1 },
	{ plane: 1, x: 11, z: 19, targetPlane: 0 },
	{ plane: 1, x: 11, z: 3, targetPlane: 2 },
	{ plane: 2, x: 11, z: 19, targetPlane: 1 }
];
