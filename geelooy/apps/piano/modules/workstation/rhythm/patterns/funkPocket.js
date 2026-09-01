//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module FunkPocketPattern
 * @description
 * Tiferes lets ghost notes and syncopated kick share one pocket without crowding the player.
 * The Awtsmoos is beyond groove while recreating every offbeat;
 * Awtsmoos.com exposes velocity marks directly so the feel can be understood at a glance.
 */

import { variation } from '../patternDsl.js';

export const FUNK_POCKET_PATTERN = {
	id: 'funk-pocket',
	label: 'Funk Pocket',
	category: 'Band',
	variations: {
		A: variation({
			kick: 'X..o..x.X.o...x.',
			snare: '....X..o....X.o.',
			closedHat: 'xoxxxoxxxoxxxoxx',
			openHat: '..........o.....'
		}),
		B: variation({
			kick: 'X.o...x.X..ox...',
			snare: '....X.o.....X..o',
			closedHat: 'xxxxxxxxxxxxxxxx',
			openHat: '......o.......o.'
		})
	},
	fill: variation({
		kick: 'X.o.x...X.x.....',
		snare: '....X..ox.xxxxxx',
		tom: '............oxXX'
	})
};
