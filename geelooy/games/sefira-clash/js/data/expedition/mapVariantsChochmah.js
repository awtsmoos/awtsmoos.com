//B"H
//Boruch Hashem
//Blessed is He

/** Chochmah reveals Storm Camp, Lightning Wood, and Wisdom Rift through authored roads. */

import { road } from './mapVariantBuilders.js';

export const CHOCHMAH_MAP_VARIANTS = Object.freeze([
	road(
		'storm-camp',
		'settlement',
		780,
		[
			[-1000, 520, 520, 28, 'camp'],
			[-180, 380, 460, 26, 'kite'],
			[620, 540, 520, 28, 'camp'],
			[1500, 280, 620, 30, 'watch'],
			[2560, 500, 520, 28, 'kite'],
			[3480, 250, 620, 30, 'storm']
		],
		{
			serviceNodes: [
				{ id: 'scout', x: 50, y: 300 },
				{ id: 'seer', x: 1760, y: 220 }
			],
			weatherTags: ['lightning', 'dusk']
		}
	),
	road(
		'lightning-wood',
		'wilderness',
		830,
		[
			[-1060, 600, 500, 24, 'charged-root'],
			[-300, 430, 420, 22, 'charged-branch'],
			[500, 610, 520, 24, 'charged-root'],
			[1320, 320, 500, 22, 'charged-branch'],
			[2220, 580, 560, 24, 'charged-root'],
			[3200, 300, 620, 22, 'charged-branch']
		],
		{ weatherTags: ['lightning', 'storm'] }
	),
	road(
		'wisdom-rift',
		'climax',
		780,
		[
			[-1000, 520, 520, 28, 'rift'],
			[-120, 300, 520, 30, 'flash'],
			[820, 520, 520, 28, 'rift'],
			[1700, 210, 720, 34, 'sage'],
			[2920, 520, 520, 28, 'rift'],
			[3800, 300, 520, 30, 'flash']
		],
		{ bossNode: [2060, 100], weatherTags: ['void', 'lightning'] }
	)
]);
