//B"H
//Boruch Hashem
//Blessed is He

/** Gevurah reveals Forgehold, Ironwood, and Furnace Depths through authored roads. */

import { road } from './mapVariantBuilders.js';

export const GEVURAH_MAP_VARIANTS = Object.freeze([
	road(
		'forgehold',
		'settlement',
		780,
		[
			[-1000, 520, 520, 28, 'forge'],
			[-180, 390, 460, 26, 'anvil'],
			[620, 540, 520, 28, 'forge'],
			[1500, 290, 620, 30, 'foundry'],
			[2560, 500, 520, 28, 'anvil'],
			[3480, 260, 620, 30, 'armory']
		],
		{
			serviceNodes: [
				{ id: 'smith', x: 50, y: 300 },
				{ id: 'armorer', x: 1760, y: 220 }
			],
			weatherTags: ['embers', 'afternoon']
		}
	),
	road(
		'ironwood',
		'wilderness',
		830,
		[
			[-1080, 600, 500, 24, 'iron-root'],
			[-300, 450, 420, 22, 'iron-branch'],
			[500, 610, 520, 24, 'iron-root'],
			[1320, 350, 500, 22, 'iron-branch'],
			[2240, 580, 560, 24, 'iron-root'],
			[3220, 320, 620, 22, 'iron-branch']
		],
		{ weatherTags: ['smoke', 'sunset'] }
	),
	road(
		'furnace-depths',
		'climax',
		780,
		[
			[-1000, 520, 520, 28, 'furnace'],
			[-120, 320, 520, 30, 'vent'],
			[820, 520, 520, 28, 'furnace'],
			[1700, 220, 720, 34, 'judge'],
			[2920, 520, 520, 28, 'furnace'],
			[3800, 320, 520, 30, 'vent']
		],
		{ bossNode: [2060, 110], weatherTags: ['heat-haze', 'night'] }
	)
]);
