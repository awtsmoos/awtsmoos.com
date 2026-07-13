//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the beit midrash bouncer vessel in this instant, revealing
 * its focused js data maps service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
import { bounds, hole, makeMap, platform, points, sideWalls, solidFloor } from './factory.js';

/**
 * B"H
 * Beit Midrash Bouncer: mostly safe, wall-bounce combat.
 *
 * Chapter 158: a giant floor, two holy walls, and only two real exits. Players
 * can survive huge smashes by bouncing, then fight back through the noise.
 */
export const beitMidrashBouncer = makeMap({
	id: 'beit-midrash-bouncer',
	name: 'Beit Midrash Bouncer',
	theme: 'parchment',
	hue: 38,
	description:
		'Huge solid floor, bouncy side walls, tiny holes, excellent for long chaotic fights.',
	bounds: bounds(-1700, 6500, -1800, 1850),
	rules: { walled: true, wallBounce: true },
	holes: [hole(780, 360), hole(4460, 420)],
	walls: sideWalls(-1450, 6200, -1600, 1200, 90),
	spawns: points([-900, 820], [250, 820], [1500, 820], [2850, 820], [4100, 820], [5550, 820]),
	platforms: [
		...solidFloor(-1450, 900, 7650, 70, [hole(780, 360), hole(4460, 420)]),
		platform(-800, 430, 620, 32, 'balcony'),
		platform(680, 220, 520, 28, 'shelf'),
		platform(2030, 430, 720, 32, 'table'),
		platform(3420, 210, 560, 28, 'shelf'),
		platform(5120, 430, 620, 32, 'balcony')
	],
	weaponSpawns: points([-520, 820], [930, 150], [2450, 360], [3700, 150], [5450, 820]),
	powerupSpawns: points([200, 740], [1800, 330], [3280, 740], [4980, 330])
});
