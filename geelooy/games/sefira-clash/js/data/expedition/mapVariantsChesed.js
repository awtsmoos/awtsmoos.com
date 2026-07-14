//B"H
//Boruch Hashem
//Blessed is He

/** Chesed reveals River City, Mercy Grove, and Bridge of Light through authored roads. */

import { road } from './mapVariantBuilders.js';

export const CHESED_MAP_VARIANTS = Object.freeze([
	road(
		'river-city',
		'settlement',
		780,
		[
			[-1000, 520, 520, 28, 'river'],
			[-180, 380, 460, 26, 'bridge'],
			[620, 550, 520, 28, 'river'],
			[1500, 290, 620, 30, 'plaza'],
			[2560, 510, 520, 28, 'bridge'],
			[3480, 280, 620, 30, 'harbor']
		],
		{
			serviceNodes: [
				{ id: 'healer', x: 50, y: 300 },
				{ id: 'boatwright', x: 1760, y: 220 }
			],
			weatherTags: ['river-mist', 'morning']
		}
	),
	road(
		'mercy-grove',
		'wilderness',
		830,
		[
			[-1060, 600, 500, 24, 'grove'],
			[-300, 440, 420, 22, 'branch'],
			[500, 610, 520, 24, 'grove'],
			[1320, 340, 500, 22, 'branch'],
			[2220, 580, 560, 24, 'grove'],
			[3200, 310, 620, 22, 'branch']
		],
		{ weatherTags: ['soft-rain', 'morning'] }
	),
	road(
		'bridge-light',
		'climax',
		760,
		[
			[-1080, 520, 620, 28, 'bridge'],
			[-120, 400, 520, 26, 'light'],
			[760, 520, 620, 28, 'bridge'],
			[1740, 250, 760, 34, 'seraph'],
			[2960, 520, 620, 28, 'bridge'],
			[3920, 380, 520, 26, 'light']
		],
		{ bossNode: [2120, 140], weatherTags: ['radiance', 'sunrise'] }
	)
]);
