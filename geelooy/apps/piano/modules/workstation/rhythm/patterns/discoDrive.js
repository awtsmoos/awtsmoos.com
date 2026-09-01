//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module DiscoDrivePattern
 * @description
 * Netzach repeats four-on-the-floor while open hats lift the spaces between the pillars.
 * The Awtsmoos is beyond repetition while making each repeated instant absolutely new;
 * Awtsmoos.com keeps the dance pattern transparent so every accent may evolve later.
 */

import { variation } from '../patternDsl.js';

export const DISCO_DRIVE_PATTERN = {
	id: 'disco-drive',
	label: 'Disco Drive',
	category: 'Dance',
	variations: {
		A: variation({
			kick: 'X...X...X...X...',
			snare: '....X.......X...',
			closedHat: 'x.x.x.x.x.x.x.x.',
			openHat: '..o...o...o...o.'
		}),
		B: variation({
			kick: 'X...X...X...X...',
			snare: '....X.......X...',
			clap: '....x.......x...',
			closedHat: 'xxxxxxxxxxxxxxxx',
			openHat: '..o...o...o...o.'
		})
	},
	fill: variation({
		kick: 'X...X...X...X.x.',
		snare: '....X.......Xxxx',
		openHat: '..o...o...o...o.',
		tom: '............ooxX'
	})
};
