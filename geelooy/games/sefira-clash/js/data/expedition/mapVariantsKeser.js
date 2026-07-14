//B"H
//Boruch Hashem
//Blessed is He

/** Keser reveals Crown City, Unbounded Grove, and the Throne Road through authored roads. */

import { road } from './mapVariantBuilders.js';

export const KESER_MAP_VARIANTS = Object.freeze([
	road(
		'crown-city',
		'settlement',
		780,
		[
			[-1000, 520, 520, 28, 'crown'],
			[-180, 360, 460, 26, 'road'],
			[620, 520, 520, 28, 'crown'],
			[1500, 260, 620, 30, 'treasury'],
			[2560, 500, 520, 28, 'road'],
			[3480, 230, 620, 30, 'throne']
		],
		{
			serviceNodes: [
				{ id: 'elder', x: 50, y: 290 },
				{ id: 'keeper', x: 1760, y: 200 }
			],
			weatherTags: ['aurora', 'sunset']
		}
	),
	road(
		'unbounded-grove',
		'wilderness',
		840,
		[
			[-1080, 610, 500, 24, 'star-root'],
			[-300, 420, 420, 22, 'star-branch'],
			[500, 600, 520, 24, 'star-root'],
			[1320, 300, 500, 22, 'star-branch'],
			[2240, 590, 560, 24, 'star-root'],
			[3220, 280, 620, 22, 'star-branch']
		],
		{ weatherTags: ['starfall', 'aurora'] }
	),
	road(
		'throne-road',
		'climax',
		760,
		[
			[-1080, 520, 620, 28, 'throne-road'],
			[-120, 390, 520, 26, 'crown-light'],
			[760, 520, 620, 28, 'throne-road'],
			[1740, 220, 760, 34, 'unity'],
			[2960, 520, 620, 28, 'throne-road'],
			[3920, 350, 520, 26, 'crown-light']
		],
		{ bossNode: [2120, 110], weatherTags: ['aurora', 'void'] }
	)
]);
