//B"H
//Boruch Hashem
//Blessed is He

/** Binah reveals Understanding City, Labyrinth Forest, and Tower of Forms through authored roads. */

import { road } from './mapVariantBuilders.js';

export const BINAH_MAP_VARIANTS = Object.freeze([
	road(
		'understanding-city',
		'settlement',
		780,
		[
			[-1000, 520, 520, 28, 'archive'],
			[-180, 370, 460, 26, 'diagram'],
			[620, 540, 520, 28, 'archive'],
			[1500, 280, 620, 30, 'academy'],
			[2560, 500, 520, 28, 'diagram'],
			[3480, 250, 620, 30, 'tower']
		],
		{
			serviceNodes: [
				{ id: 'architect', x: 50, y: 300 },
				{ id: 'scribe', x: 1760, y: 220 }
			],
			weatherTags: ['geometric-rain', 'afternoon']
		}
	),
	road(
		'labyrinth-forest',
		'wilderness',
		840,
		[
			[-1080, 610, 500, 24, 'maze-root'],
			[-300, 430, 420, 22, 'maze-branch'],
			[500, 600, 520, 24, 'maze-root'],
			[1320, 310, 500, 22, 'maze-branch'],
			[2240, 590, 560, 24, 'maze-root'],
			[3220, 290, 620, 22, 'maze-branch']
		],
		{ weatherTags: ['fog', 'geometric-rain'] }
	),
	road(
		'tower-forms',
		'climax',
		780,
		[
			[-1000, 520, 520, 28, 'form'],
			[-120, 320, 520, 30, 'grid'],
			[820, 520, 520, 28, 'form'],
			[1700, 220, 720, 34, 'architect'],
			[2920, 520, 520, 28, 'form'],
			[3800, 320, 520, 30, 'grid']
		],
		{ bossNode: [2060, 110], weatherTags: ['geometric-rain', 'twilight'] }
	)
]);
