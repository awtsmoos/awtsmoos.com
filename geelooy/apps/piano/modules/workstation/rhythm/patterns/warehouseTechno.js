//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module WarehouseTechnoPattern
 * @description
 * Gevurah turns the grid into machinery: firm quarters, relentless hats, and a sharpened final bar.
 * The Awtsmoos is beyond machine while creating machine and listener alike;
 * Awtsmoos.com keeps the pattern explicit so intensity never requires unreadable code.
 */

import { variation } from '../patternDsl.js';

export const WAREHOUSE_TECHNO_PATTERN = {
	id: 'warehouse-techno',
	label: 'Warehouse Techno',
	category: 'Electronic',
	variations: {
		A: variation({
			kick: 'X...X...X...X...',
			clap: '....x.......x...',
			closedHat: 'xxxxxxxxxxxxxxxx',
			openHat: '..x...x...x...x.'
		}),
		B: variation({
			kick: 'X...X...X...X.x.',
			clap: '....x.......x...',
			closedHat: 'xoxoxoxoxoxoxoxo',
			openHat: '..x...x...x...x.'
		})
	},
	fill: variation({
		kick: 'X...X...X.x.XxXX',
		clap: '....x.......xxxx',
		tom: '.............oxX'
	})
};
