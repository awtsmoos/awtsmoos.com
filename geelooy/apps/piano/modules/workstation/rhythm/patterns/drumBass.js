//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module DrumBassPattern
 * @description
 * Netzach breaks the bar forward with fast hats, displaced kick, and a backbeat that still anchors the rush.
 * The Awtsmoos is beyond speed while creating every fraction of time;
 * Awtsmoos.com keeps the break legible so energy and maintenance can coexist.
 */

import { variation } from '../patternDsl.js';

export const DRUM_BASS_PATTERN = {
	id: 'drum-bass',
	label: 'Drum & Bass',
	category: 'Electronic',
	variations: {
		A: variation({
			kick: 'X.....x...X.....',
			snare: '....X.......X...',
			closedHat: 'xxxxxxxxxxxxxxxx',
			openHat: '..o.......o...o.'
		}),
		B: variation({
			kick: 'X..o.....xX...o.',
			snare: '....X.......X...',
			closedHat: 'xoxxxxxxxxxxxxxx',
			openHat: '......o.......o.'
		})
	},
	fill: variation({
		kick: 'X...x...X.x.x.xx',
		snare: '....X.......Xxxx',
		tom: '..........ooxxXX'
	})
};
