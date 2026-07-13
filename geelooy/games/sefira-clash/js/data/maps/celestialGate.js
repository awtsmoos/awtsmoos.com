//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the celestial gate vessel in this instant, revealing
 * its focused js data maps service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
import { bounds, lane, makeMap, platform, points, steps } from './factory.js';

/** B"H — Celestial Gate opens a huge upper doorway for aerial control. */
export const celestialGate = makeMap({
	id: 'celestial-gate',
	name: 'Celestial Gate',
	theme: 'blue',
	hue: 275,
	description: 'A giant gate stage with high center control and side lanes.',
	bounds: bounds(-3000, 9400, -2400, 1700),
	spawns: points([-650, 250], [900, -200], [2600, 250], [4300, -200], [6100, 250]),
	platforms: [
		...lane(-1900, 850, 12),
		...steps(-800, 520, 12),
		...steps(-300, -140, 10),
		platform(2650, -1160, 900, 30, 'gate')
	],
	weaponSpawns: points([180, 520], [1750, -70], [3100, -1200], [4650, -70], [6300, 520]),
	powerupSpawns: points([820, 350], [2200, -350], [3100, -1320], [4000, -350], [5600, 350])
});
