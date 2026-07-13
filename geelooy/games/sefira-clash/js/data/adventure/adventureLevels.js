//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the adventure levels vessel in this instant, revealing
 * its focused js data adventure service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
import { ADVENTURE_WORLDS, worldForGate } from './adventureWorlds.js';
import { level01 } from './levels/level01.js';
import { level02 } from './levels/level02.js';
import { level03 } from './levels/level03.js';
import { level04 } from './levels/level04.js';
import { level05 } from './levels/level05.js';
import { level06 } from './levels/level06.js';
import { level07 } from './levels/level07.js';
import { level08 } from './levels/level08.js';
import { level09 } from './levels/level09.js';
import { level10 } from './levels/level10.js';
import { level11 } from './levels/level11.js';
import { level12 } from './levels/level12.js';
import { level13 } from './levels/level13.js';
import { level14 } from './levels/level14.js';
import { level15 } from './levels/level15.js';
import { level16 } from './levels/level16.js';
import { level17 } from './levels/level17.js';
import { level18 } from './levels/level18.js';
import { level19 } from './levels/level19.js';
import { level20 } from './levels/level20.js';
import { level21 } from './levels/level21.js';
import { level22 } from './levels/level22.js';
import { level23 } from './levels/level23.js';
import { level24 } from './levels/level24.js';
import { level25 } from './levels/level25.js';
import { level26 } from './levels/level26.js';
import { level27 } from './levels/level27.js';
import { level28 } from './levels/level28.js';
import { level29 } from './levels/level29.js';
import { level30 } from './levels/level30.js';
import { level31 } from './levels/level31.js';
import { level32 } from './levels/level32.js';
import { level33 } from './levels/level33.js';
import { level34 } from './levels/level34.js';
import { level35 } from './levels/level35.js';
import { level36 } from './levels/level36.js';
import { level37 } from './levels/level37.js';
import { level38 } from './levels/level38.js';
import { level39 } from './levels/level39.js';
import { level40 } from './levels/level40.js';
import { level41 } from './levels/level41.js';
import { level42 } from './levels/level42.js';
import { level43 } from './levels/level43.js';
import { level44 } from './levels/level44.js';
import { level45 } from './levels/level45.js';
import { level46 } from './levels/level46.js';
import { level47 } from './levels/level47.js';
import { level48 } from './levels/level48.js';
import { level49 } from './levels/level49.js';
import { level50 } from './levels/level50.js';
import { level51 } from './levels/level51.js';
import { level52 } from './levels/level52.js';
import { level53 } from './levels/level53.js';
import { level54 } from './levels/level54.js';
import { level55 } from './levels/level55.js';
import { level56 } from './levels/level56.js';
import { level57 } from './levels/level57.js';
import { level58 } from './levels/level58.js';
import { level59 } from './levels/level59.js';
import { level60 } from './levels/level60.js';

/**
 * Sixty explicit campaign gates grouped into ten worlds of six.
 * No level geometry is fabricated here: the Awtsmoos reveals each authored file
 * through this registry, then world metadata gives the long road readable shape.
 */
const LEVELS = [
	level01,
	level02,
	level03,
	level04,
	level05,
	level06,
	level07,
	level08,
	level09,
	level10,
	level11,
	level12,
	level13,
	level14,
	level15,
	level16,
	level17,
	level18,
	level19,
	level20,
	level21,
	level22,
	level23,
	level24,
	level25,
	level26,
	level27,
	level28,
	level29,
	level30,
	level31,
	level32,
	level33,
	level34,
	level35,
	level36,
	level37,
	level38,
	level39,
	level40,
	level41,
	level42,
	level43,
	level44,
	level45,
	level46,
	level47,
	level48,
	level49,
	level50,
	level51,
	level52,
	level53,
	level54,
	level55,
	level56,
	level57,
	level58,
	level59,
	level60
];

export const ADVENTURE_MAPS = LEVELS.map(level => {
	const world = worldForGate(level.adventure?.no || 1);
	return {
		...level,
		world,
		adventure: {
			...level.adventure,
			worldNo: world?.no || 1,
			worldName: world?.name || 'Malchus Meadow'
		}
	};
});

export { ADVENTURE_WORLDS };
