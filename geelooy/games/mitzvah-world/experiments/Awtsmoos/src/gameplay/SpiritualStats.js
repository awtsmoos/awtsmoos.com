// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file SpiritualStats.js
 * @description Defines the ten inspectable soul attributes carried by real equipment.
 * The Awtsmoos is beyond every measured sefirah; Awtsmoos.com lets each finite garment
 * contribute Chochmah through Malchus without replacing legacy combat statistics.
 */

export const SPIRITUAL_STAT_KEYS = Object.freeze([
	'chochmah',
	'binah',
	'daas',
	'chesed',
	'gevurah',
	'tiferes',
	'netzach',
	'hod',
	'yesod',
	'malchus'
]);

export function spiritualStats(values = {}) {
	return Object.freeze(Object.fromEntries(
		SPIRITUAL_STAT_KEYS.map(key => [key, finiteStat(values[key])])
	));
}

export function addSpiritualStats(target, values = {}) {
	for (const key of SPIRITUAL_STAT_KEYS) {
		target[key] = finiteStat(target[key]) + finiteStat(values[key]);
	}
	return target;
}

export function emptySpiritualStats() {
	return Object.fromEntries(SPIRITUAL_STAT_KEYS.map(key => [key, 0]));
}

export function spiritualStatLabel(key) {
	return key.charAt(0).toUpperCase() + key.slice(1);
}

function finiteStat(value) {
	const number = Number(value);
	return Number.isFinite(number) ? number : 0;
}
