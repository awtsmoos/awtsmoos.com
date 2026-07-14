//B"H
//Boruch Hashem
//Blessed is He

/** Hod reveals market, echo forest, and mirrored palace through authored roads. */

import { road } from './mapVariantBuilders.js';

export const HOD_MAP_VARIANTS = Object.freeze([
	road(
		'mirror-market',
		'settlement',
		760,
		[
			[-980, 510, 500, 28, 'stall'],
			[-180, 360, 420, 26, 'mirror'],
			[560, 520, 520, 28, 'stall'],
			[1440, 300, 620, 30, 'gallery'],
			[2500, 480, 520, 28, 'arcade'],
			[3400, 260, 620, 30, 'palace']
		],
		{
			serviceNodes: [
				{ id: 'merchant', x: 40, y: 290 },
				{ id: 'archivist', x: 1680, y: 230 }
			],
			weatherTags: ['glimmer', 'afternoon']
		}
	),
	road(
		'echo-forest',
		'wilderness',
		820,
		[
			[-1080, 560, 520, 24, 'root'],
			[-320, 360, 420, 22, 'echo-branch'],
			[460, 610, 520, 24, 'root'],
			[1320, 300, 520, 22, 'echo-branch'],
			[2240, 550, 560, 24, 'root'],
			[3240, 280, 600, 22, 'echo-branch']
		],
		{ weatherTags: ['fog', 'echo-rain'] }
	),
	road(
		'palace-reflections',
		'climax',
		780,
		[
			[-1000, 500, 520, 28, 'mirror'],
			[-120, 300, 520, 30, 'hall'],
			[820, 500, 520, 28, 'mirror'],
			[1700, 220, 720, 34, 'throne'],
			[2920, 500, 520, 28, 'mirror'],
			[3800, 300, 520, 30, 'hall']
		],
		{ bossNode: [2060, 110], weatherTags: ['glimmer', 'night'] }
	)
]);
