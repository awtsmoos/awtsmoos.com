//B"H
//Boruch Hashem
//Blessed is He

/** Yesod reveals moonworks, silver marsh, and the foundation engine through authored roads. */

import { road } from './mapVariantBuilders.js';

export const YESOD_MAP_VARIANTS = Object.freeze([
	road(
		'moonworks-city',
		'settlement',
		780,
		[
			[-1000, 520, 520, 28, 'gear'],
			[-180, 380, 460, 26, 'bridge'],
			[620, 540, 520, 28, 'gear'],
			[1500, 280, 620, 30, 'tower'],
			[2560, 500, 520, 28, 'bridge'],
			[3480, 250, 620, 30, 'engine']
		],
		{
			serviceNodes: [
				{ id: 'engineer', x: 40, y: 310 },
				{ id: 'warden', x: 1760, y: 210 }
			],
			weatherTags: ['mist', 'moonlit']
		}
	),
	road(
		'silver-reeds',
		'wilderness',
		830,
		[
			[-1060, 610, 500, 24, 'reed'],
			[-300, 450, 420, 22, 'reed'],
			[500, 610, 520, 24, 'marsh'],
			[1320, 340, 500, 22, 'reed'],
			[2220, 580, 560, 24, 'marsh'],
			[3200, 310, 620, 22, 'reed']
		],
		{ weatherTags: ['mist', 'soft-rain'] }
	),
	road(
		'foundation-engine',
		'climax',
		780,
		[
			[-1000, 520, 520, 28, 'gear'],
			[-120, 320, 520, 30, 'gantry'],
			[820, 520, 520, 28, 'gear'],
			[1700, 220, 720, 34, 'core'],
			[2920, 520, 520, 28, 'gear'],
			[3800, 320, 520, 30, 'gantry']
		],
		{ bossNode: [2060, 110], weatherTags: ['sparks', 'night'] }
	)
]);
