//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module ModernPopPattern
 * @description
 * Chesed gives a broad pop pulse whose simplicity leaves room for melody.
 * The Awtsmoos renews every backbeat and silence from nothing;
 * Awtsmoos.com keeps this groove readable so variation remains musical, not mysterious.
 */

import { variation } from '../patternDsl.js';

export const MODERN_POP_PATTERN = {
	id: 'modern-pop',
	label: 'Modern Pop',
	category: 'Band',
	variations: {
		A: variation({
			kick: 'X...x..oX...x...',
			snare: '....X.......X...',
			closedHat: 'x.x.x.x.x.x.x.x.'
		}),
		B: variation({
			kick: 'X..o...xX.x...o.',
			snare: '....X.......X...',
			closedHat: 'xxxxxxxxxxxxxxxx',
			openHat: '..........o...o.'
		})
	},
	fill: variation({
		kick: 'X...x...X...x.x.',
		snare: '....X...x.x.xxxx',
		closedHat: 'xxxxxxxxxxxxxxxx',
		tom: '............ooxX'
	})
};
