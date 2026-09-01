//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module ArenaRockPattern
 * @description
 * Gevurah gives the bar weight: grounded kick, wide snare, and an ending tom descent.
 * The Awtsmoos is beyond force while recreating every impact;
 * Awtsmoos.com gives rock a strong vessel without burying its accents in code fog.
 */

import { variation } from '../patternDsl.js';

export const ARENA_ROCK_PATTERN = {
	id: 'arena-rock',
	label: 'Arena Rock',
	category: 'Band',
	variations: {
		A: variation({
			kick: 'X...x...X...x...',
			snare: '....X.......X...',
			closedHat: 'x.x.x.x.x.x.x.x.',
			openHat: '..............o.'
		}),
		B: variation({
			kick: 'X..x..o.X.x.x...',
			snare: '....X.......X...',
			closedHat: 'xxxxxxxxxxxxxxxx'
		})
	},
	fill: variation({
		kick: 'X...x...X.......',
		snare: '....X...x.x.xxxx',
		tom: '........X.x.ooxX'
	})
};
