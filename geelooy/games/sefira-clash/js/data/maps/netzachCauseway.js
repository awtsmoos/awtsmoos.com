//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the netzach causeway vessel in this instant, revealing
 * its focused js data maps service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
import { bounds, lane, makeMap, points, steps } from './factory.js';

/** B"H — Netzach becomes the endless chase road where speed is judgment. */
export const netzachCauseway = makeMap({
	id: 'netach-causeway',
	name: 'Netzach Endless Causeway',
	theme: 'parchment',
	hue: 112,
	description: 'Enormous horizontal duel road for speed, chase, and whiff punishes.',
	bounds: bounds(-2600, 9000, -950, 1350),
	spawns: points([-500, 260], [1200, 260], [3000, 260], [4800, 260], [6600, 260]),
	platforms: [...lane(-1600, 760, 12), ...steps(-600, 520, 12)],
	weaponSpawns: points([200, 480], [1700, 480], [3200, 390], [5000, 480], [6900, 480]),
	powerupSpawns: points([980, 380], [2500, 380], [4200, 380], [5900, 380])
});
