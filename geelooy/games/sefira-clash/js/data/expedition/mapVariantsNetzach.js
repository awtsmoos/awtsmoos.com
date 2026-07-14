//B"H
//Boruch Hashem
//Blessed is He

/** Netzach reveals port, endurance wood, and endless causeway through authored roads. */

import { road } from './mapVariantBuilders.js';

export const NETZACH_MAP_VARIANTS = Object.freeze([
	road(
		'victory-port',
		'settlement',
		780,
		[
			[-1000, 520, 520, 28, 'dock'],
			[-180, 380, 460, 24, 'warehouse'],
			[620, 560, 520, 28, 'dock'],
			[1500, 300, 600, 30, 'lighthouse'],
			[2520, 520, 520, 28, 'ship'],
			[3440, 330, 620, 30, 'harbor']
		],
		{
			serviceNodes: [
				{ id: 'captain', x: 50, y: 310 },
				{ id: 'runner', x: 1760, y: 230 }
			],
			weatherTags: ['sea-wind', 'sunrise']
		}
	),
	road(
		'endurance-wood',
		'wilderness',
		830,
		[
			[-1050, 610, 480, 24, 'root'],
			[-300, 470, 420, 22, 'branch'],
			[500, 600, 500, 24, 'root'],
			[1320, 380, 500, 22, 'branch'],
			[2220, 590, 520, 24, 'root'],
			[3180, 350, 620, 22, 'branch']
		],
		{ weatherTags: ['wind', 'golden-hour'] }
	),
	road(
		'endless-causeway',
		'climax',
		760,
		[
			[-1080, 520, 620, 28, 'causeway'],
			[-120, 420, 520, 26, 'causeway'],
			[760, 520, 620, 28, 'causeway'],
			[1740, 260, 760, 34, 'victory'],
			[2960, 520, 620, 28, 'causeway'],
			[3920, 380, 520, 26, 'causeway']
		],
		{ bossNode: [2120, 150], weatherTags: ['high-wind', 'sunset'] }
	)
]);
