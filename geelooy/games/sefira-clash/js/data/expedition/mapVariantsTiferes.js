//B"H
//Boruch Hashem
//Blessed is He

/** Tiferes reveals harmony city, sunlit gardens, and heart sanctum through authored roads. */

import { road } from './mapVariantBuilders.js';

export const TIFERES_MAP_VARIANTS = Object.freeze([
	road(
		'harmony-city',
		'settlement',
		760,
		[
			[-1000, 520, 520, 28, 'terrace'],
			[-180, 360, 460, 26, 'garden'],
			[600, 520, 520, 28, 'terrace'],
			[1480, 280, 620, 30, 'plaza'],
			[2540, 500, 520, 28, 'garden'],
			[3460, 260, 620, 30, 'sanctuary']
		],
		{
			serviceNodes: [
				{ id: 'gardener', x: 50, y: 290 },
				{ id: 'cantor', x: 1730, y: 210 }
			],
			weatherTags: ['sunbeams', 'noon']
		}
	),
	road(
		'sunlit-gardens',
		'wilderness',
		820,
		[
			[-1050, 600, 520, 24, 'garden'],
			[-260, 420, 420, 22, 'vine'],
			[500, 610, 520, 24, 'garden'],
			[1340, 330, 500, 22, 'vine'],
			[2240, 570, 560, 24, 'garden'],
			[3240, 300, 620, 22, 'vine']
		],
		{ weatherTags: ['petal-rain', 'noon'] }
	),
	road(
		'heart-sanctum',
		'climax',
		780,
		[
			[-1000, 510, 520, 28, 'altar'],
			[-120, 310, 520, 30, 'choir'],
			[820, 510, 520, 28, 'altar'],
			[1700, 220, 720, 34, 'heart'],
			[2920, 510, 520, 28, 'altar'],
			[3800, 310, 520, 30, 'choir']
		],
		{ bossNode: [2060, 110], weatherTags: ['radiance', 'dusk'] }
	)
]);
