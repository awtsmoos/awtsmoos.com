//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module DeepHousePattern
 * @description
 * Chesed opens a steady house floor and lets hats shimmer around its center.
 * The Awtsmoos is beyond club and chamber while creating every audible pulse;
 * Awtsmoos.com presents the groove plainly so its warmth is editable rather than opaque.
 */

import { variation } from '../patternDsl.js';

export const DEEP_HOUSE_PATTERN = {
	id: 'deep-house',
	label: 'Deep House',
	category: 'Electronic',
	variations: {
		A: variation({
			kick: 'X...X...X...X...',
			clap: '....X.......X...',
			closedHat: 'x.x.x.x.x.x.x.x.',
			openHat: '..o...o...o...o.'
		}),
		B: variation({
			kick: 'X...X.x.X...X.x.',
			clap: '....X.......X...',
			closedHat: 'xxxxxxxxxxxxxxxx',
			openHat: '..o...o...o...o.'
		})
	},
	fill: variation({
		kick: 'X...X...X...X.xx',
		clap: '....X.......Xxxx',
		openHat: '..o...o...o...o.'
	})
};
